import os
import json
import re
import threading
import time
from collections import OrderedDict
from contextlib import asynccontextmanager
from typing import Any

import google.generativeai as genai
import requests
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from rag import init_db, retrieve_context

load_dotenv()

KEEP_AWAKE_URL = "https://4f885503-e5cb-4db5-85ab-3ae7992bd07d-00-2bej0mybq1zq3.riker.replit.dev"
COOLDOWN_SECONDS = 10
CACHE_LIMIT = 50
GEMINI_RETRIES = 2
GEMINI_RETRY_DELAY_SECONDS = 2

response_cache = OrderedDict()
ip_cooldowns = {}
state_lock = threading.Lock()


def keep_awake_loop():
    while True:
        time.sleep(180)
        try:
            requests.get(KEEP_AWAKE_URL, timeout=10)
        except requests.RequestException:
            pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    threading.Thread(target=keep_awake_loop, daemon=True).start()
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


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation error: {exc}")
    return JSONResponse(
        status_code=200,
        content={
            "success": False,
            "data": None,
            "error": "Please provide valid code and language fields.",
        },
    )


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


def success_response(data: Any, cached: bool = False):
    return {
        "success": True,
        "data": data,
        "error": None,
        "cached": cached,
    }


def error_response(message: str):
    return {
        "success": False,
        "data": None,
        "error": message,
    }


def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def get_cache_key(code: str, language: str) -> str:
    return json.dumps(
        {"code": code.strip(), "language": language.strip().lower()},
        sort_keys=True,
    )


def get_cached_response(cache_key: str):
    with state_lock:
        cached = response_cache.get(cache_key)
        if cached is not None:
            response_cache.move_to_end(cache_key)
        return cached


def set_cached_response(cache_key: str, data: Any):
    with state_lock:
        response_cache[cache_key] = data
        response_cache.move_to_end(cache_key)
        while len(response_cache) > CACHE_LIMIT:
            response_cache.popitem(last=False)


def is_on_cooldown(ip_address: str) -> bool:
    now = time.time()
    with state_lock:
        last_request = ip_cooldowns.get(ip_address)
        if last_request and now - last_request < COOLDOWN_SECONDS:
            return True
        ip_cooldowns[ip_address] = now
        return False


def is_rate_limit_error(error: Exception) -> bool:
    message = str(error).lower()
    return any(
        phrase in message
        for phrase in [
            "429",
            "quota",
            "rate limit",
            "rate_limit",
            "too many requests",
            "resource exhausted",
            "exceeded",
        ]
    )


def build_explain_data(result: dict[str, Any], language: str):
    return {
        "summary": result.get("summary", ""),
        "language": result.get("language", language),
        "complexity": result.get("complexity", ""),
        "lineByLine": result.get("lineByLine", []),
        "bugs": normalize_text_list(result.get("bugs", []), "No bugs detected."),
        "optimizations": normalize_text_list(
            result.get("optimizations", []),
            "No optimizations suggested.",
        ),
        "timeComplexity": result.get("timeComplexity", ""),
    }


def call_gemini_with_retries(model, prompt: str):
    last_error = None
    for attempt in range(GEMINI_RETRIES + 1):
        try:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"},
            )
            return response
        except Exception as error:
            last_error = error
            if is_rate_limit_error(error):
                print(f"Gemini rate/quota error on attempt {attempt + 1}: {error}")
            else:
                print(f"Gemini error on attempt {attempt + 1}: {error}")
            if attempt < GEMINI_RETRIES:
                time.sleep(GEMINI_RETRY_DELAY_SECONDS)
    raise last_error


@app.get("/")
async def root():
    return {
        "message": "CodeLens Backend is running",
        "docs": "/docs",
        "explain": "/explain",
        "index": "/index",
    }


@app.post("/explain")
async def explain(request: Request):
    try:
        body = await request.json()
    except Exception as error:
        print(f"Invalid JSON body: {error}")
        return error_response("Please send a valid JSON request.")

    if not isinstance(body, dict):
        return error_response("Please send a valid JSON request.")

    code = str(body.get("code", "")).strip()
    language = str(body.get("language", "")).strip()

    if not code or not language:
        return error_response("Please provide both code and language before trying again.")

    cache_key = get_cache_key(code, language)
    cached_data = get_cached_response(cache_key)
    if cached_data is not None:
        return success_response(cached_data, cached=True)

    client_ip = get_client_ip(request)
    if is_on_cooldown(client_ip):
        return error_response("You're using it too fast. Please wait a few seconds before trying again.")

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY is not configured")
        return error_response("AI is currently busy due to high traffic. Please try again in 30–60 seconds.")

    try:
        context = retrieve_context(code)
    except Exception as error:
        print(f"Context retrieval failed: {error}")
        context = "No similar snippets found yet."

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""
You are CodeLens, a careful programming tutor and code reviewer.

Use this retrieved context from similar code snippets:
{context}

Analyze this {language} code:
{code}

Return only valid JSON with this exact structure:
{{
  "summary": "short plain-English explanation",
  "language": "{language}",
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
        response = call_gemini_with_retries(model, prompt)
        result = parse_json_response(response.text)
        data = build_explain_data(result, language)
        set_cached_response(cache_key, data)
        return success_response(data, cached=False)
    except json.JSONDecodeError as error:
        print(f"Gemini returned invalid JSON: {error}")
    except Exception as error:
        print(f"Gemini failed after retries: {error}")

    return error_response("AI is currently busy due to high traffic. Please try again in 30–60 seconds.")


@app.post("/index")
async def index():
    return {"message": "index endpoint placeholder"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, root_path="")
