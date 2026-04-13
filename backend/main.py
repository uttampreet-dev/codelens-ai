import os
import json
import re
from contextlib import asynccontextmanager
from typing import Any

import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from rag import init_db, retrieve_context

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="CodeLens Backend",
    lifespan=lifespan,
    root_path="",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    servers=[{"url": "/"}],
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExplainRequest(BaseModel):
    code: str
    language: str


def parse_json_response(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned, re.DOTALL)
    if fenced:
        cleaned = fenced.group(1).strip()
    return json.loads(cleaned)


def normalize_text_list(value: Any, empty_message: str) -> str:
    if isinstance(value, list):
        if not value:
            return empty_message
        return "\n".join(str(item) for item in value)
    if value:
        return str(value)
    return empty_message


@app.get("/")
async def root():
    return {
        "message": "CodeLens Backend is running",
        "docs": "/docs",
        "explain": "/explain",
        "index": "/index",
    }


@app.post("/explain")
async def explain(request: ExplainRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="code is required")
    if not request.language.strip():
        raise HTTPException(status_code=400, detail="language is required")

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured")

    context = retrieve_context(request.code)
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""
You are CodeLens, a careful programming tutor and code reviewer.

Use this retrieved context from similar code snippets:
{context}

Analyze this {request.language} code:
{request.code}

Return only valid JSON with this exact structure:
{{
  "summary": "short plain-English explanation",
  "language": "{request.language}",
  "complexity": "Beginner, Intermediate, or Advanced",
  "lineByLine": [
    {{"line": 1, "code": "the code on that line", "explanation": "what it does"}}
  ],
  "bugs": ["possible bugs or edge cases"],
  "optimizations": ["specific improvements"],
  "timeComplexity": "Big-O time complexity with a short explanation"
}}
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"},
        )
        result = parse_json_response(response.text)
    except json.JSONDecodeError as error:
        raise HTTPException(status_code=502, detail="Gemini returned invalid JSON") from error
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {error}") from error

    return {
        "summary": result.get("summary", ""),
        "language": result.get("language", request.language),
        "complexity": result.get("complexity", ""),
        "lineByLine": result.get("lineByLine", []),
        "bugs": normalize_text_list(result.get("bugs", []), "No bugs detected."),
        "optimizations": normalize_text_list(
            result.get("optimizations", []),
            "No optimizations suggested.",
        ),
        "timeComplexity": result.get("timeComplexity", ""),
    }


@app.post("/index")
async def index():
    return {"message": "index endpoint placeholder"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, root_path="")