import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from rag_app import query_rag, setup_rag_chain

app = FastAPI(
    title="VidyaMargdarshak RAG Microservice",
    description="Vector Search & LLM Retrieval-Augmented Generation Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RAGQueryRequest(BaseModel):
    query: str
    user_context: Optional[Dict[str, Any]] = None

class SourceDoc(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = None

class RAGQueryResponse(BaseModel):
    success: bool
    answer: str
    sources: List[SourceDoc]

@app.on_event("startup")
def startup_event():
    import threading
    def init_chain():
        print("[+] Initializing RAG chain in background...")
        try:
            setup_rag_chain()
            print("[+] RAG Chain background setup completed successfully.")
        except Exception as e:
            print(f"[!] Warning: RAG chain background initialization issue: {e}")

    threading.Thread(target=init_chain, daemon=True).start()

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "VidyaMargdarshak RAG API"}

@app.post("/api/v1/query", response_model=RAGQueryResponse)
def handle_rag_query(request: RAGQueryRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")

    try:
        result = query_rag(request.query, request.user_context)
        return RAGQueryResponse(
            success=True,
            answer=result["answer"],
            sources=result.get("sources", [])
        )
    except Exception as e:
        print(f"[RAG API Error]: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("RAG_PORT", 8000))
    uvicorn.run("rag_server:app", host="0.0.0.0", port=port, reload=True)
