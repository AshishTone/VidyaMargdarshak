"""
Helper script to download BAAI/bge-m3 embedding model directly into vidyaai/models/bge-m3.
Run this script if you need a self-contained local copy of the model for offline use:
    python download_model.py
"""
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from rag.config import EMBEDDING_MODEL_NAME, LOCAL_MODEL_DIR

def download_model(target_dir: Path = LOCAL_MODEL_DIR):
    print(f"Downloading model '{EMBEDDING_MODEL_NAME}' to local folder:")
    print(f"  Target: {target_dir}")
    target_dir.mkdir(parents=True, exist_ok=True)

    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    print("Saving model weights locally...")
    model.save(str(target_dir))
    print(f"Model successfully saved to {target_dir}")

if __name__ == "__main__":
    download_model()
