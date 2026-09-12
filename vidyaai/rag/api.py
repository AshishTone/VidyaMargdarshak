from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import sys
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Ensure vidyaai directory is on sys.path regardless of execution working directory
_vidyaai_root = str(Path(__file__).resolve().parent.parent)
if _vidyaai_root not in sys.path:
    sys.path.insert(0, _vidyaai_root)

from rag.config import GEMINI_MODEL_NAME, EMBEDDING_MODEL_NAME, COLLECTION_NAME, DEFAULT_TOP_K, GEMINI_API_KEY
from rag.rag_engine import VidyaAIRAG
from rag.vector_store import VectorStoreManager

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

app = FastAPI(
    title="VidyaAI RAG API",
    description="Backend RAG API powered by BAAI/bge-m3 embeddings and Gemini LLM for educational counselling.",
    version="1.0.0"
)

# Enable CORS for frontend website and floating chatbot widget integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Initialize singletons
vector_store = VectorStoreManager()
rag_engine = VidyaAIRAG(vector_store=vector_store)

@app.get("/")
def get_root():
    """Serves the preview website with floating chatbot widget."""
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {"message": "VidyaAI RAG API is running. See /docs for API documentation."}


class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., description="Student query or message")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Prior chat history")
    filters: Optional[Dict[str, Any]] = Field(default=None, description="Metadata filters (e.g. {'category': 'admissions'})")
    top_k: Optional[int] = Field(default=DEFAULT_TOP_K, description="Number of context chunks to retrieve")

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    retrieved_count: int

class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    top_k: Optional[int] = Field(default=DEFAULT_TOP_K, description="Number of results")
    filters: Optional[Dict[str, Any]] = Field(default=None, description="Metadata filters")

@app.get("/api/health")
def health_check():
    """Returns system status, chunk count, and model configuration."""
    count = vector_store.count()
    return {
        "status": "healthy",
        "total_chunks_indexed": count,
        "collection_name": COLLECTION_NAME,
        "embedding_model": EMBEDDING_MODEL_NAME,
        "embedding_dim": 1024,
        "gemini_model": GEMINI_MODEL_NAME,
        "gemini_api_key_configured": bool(GEMINI_API_KEY)
    }

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """Processes student query through RAG pipeline with Gemini synthesis."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    history_dicts = [{"role": m.role, "content": m.content} for m in request.history] if request.history else []
    
    result = rag_engine.answer_query(
        query=request.message,
        top_k=request.top_k or DEFAULT_TOP_K,
        filters=request.filters,
        chat_history=history_dicts
    )
    
    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"],
        retrieved_count=len(result["retrieved_chunks"])
    )

@app.post("/api/search")
def search_endpoint(request: SearchRequest):
    """Semantic similarity search directly against knowledge base chunks."""
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    results = vector_store.search(
        query=request.query,
        top_k=request.top_k or DEFAULT_TOP_K,
        where=request.filters
    )
    return {"query": request.query, "results": results}
