import uuid
from pathlib import Path

import chromadb

CHROMA_PATH = Path(__file__).resolve().parent / "chroma_db"
COLLECTION_NAME = "code_snippets"

client = None
collection = None
sentence_model = None


def init_db():
    global client, collection, sentence_model

    CHROMA_PATH.mkdir(exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    collection = client.get_or_create_collection(name=COLLECTION_NAME)

    if sentence_model is None:
        try:
            from sentence_transformers import SentenceTransformer

            sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            sentence_model = False

    return collection


def get_collection():
    if collection is None:
        return init_db()
    return collection


def embed_text(text):
    if sentence_model:
        return sentence_model.encode(text).tolist()
    return None


def add_snippet(code, language, description):
    active_collection = get_collection()
    snippet_id = str(uuid.uuid4())
    metadata = {"language": language, "description": description}

    embedding = embed_text(code)
    if embedding is not None:
        active_collection.add(
            ids=[snippet_id],
            documents=[code],
            embeddings=[embedding],
            metadatas=[metadata],
        )
    else:
        active_collection.add(
            ids=[snippet_id],
            documents=[code],
            metadatas=[metadata],
        )

    return snippet_id


def retrieve_context(query_code, k=3):
    active_collection = get_collection()
    count = active_collection.count()
    if count == 0:
        return "No similar snippets found yet."

    limit = min(k, count)
    embedding = embed_text(query_code)
    if embedding is not None:
        results = active_collection.query(query_embeddings=[embedding], n_results=limit)
    else:
        results = active_collection.query(query_texts=[query_code], n_results=limit)

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    combined = []
    for document, metadata in zip(documents, metadatas):
        language = metadata.get("language", "unknown")
        description = metadata.get("description", "")
        combined.append(f"Language: {language}\nDescription: {description}\nCode:\n{document}")

    return "\n\n---\n\n".join(combined)