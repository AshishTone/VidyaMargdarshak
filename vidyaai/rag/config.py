import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Knowledge Base & Storage Paths
KB_DIR = Path(os.getenv("KB_DIR", BASE_DIR / "Vidyamargdarshak-Knowledge-Base"))
CHROMA_PERSIST_DIR = Path(os.getenv("CHROMA_PERSIST_DIR", BASE_DIR / "data" / "chroma_db"))
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "vidyamargdarshak_kb")

# Embedding Configuration
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-m3")
EMBEDDING_DIM = 1024

# Chunking Configuration (Chunk size + Overlap)
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 900))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 150))

# Gemini LLM Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")

# Retrieval Settings
DEFAULT_TOP_K = int(os.getenv("DEFAULT_TOP_K", 6))
