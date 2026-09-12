import os
from typing import List, Union
import numpy as np
from rag.config import EMBEDDING_MODEL_NAME, EMBEDDING_DIM, LOCAL_MODEL_DIR

class BgeM3Embeddings:
    """
    Wrapper for BAAI/bge-m3 embedding model (1024-dim dense representation).
    Lazy-loads the SentenceTransformer model on first inference.
    """
    def __init__(self, model_name: str = EMBEDDING_MODEL_NAME, device: str = None):
        self.model_name = model_name
        self.device = device
        self._model = None
        self.dimension = EMBEDDING_DIM

    @property
    def model(self):
        if self._model is None:
            from pathlib import Path
            from sentence_transformers import SentenceTransformer
            import torch

            if self.device is None:
                self.device = "cuda" if torch.cuda.is_available() else "cpu"
                
            print(f"Using device: {self.device}")

            # 1. Check relative local model directory in vidyaai/models/bge-m3 or custom env var
            local_model = Path(os.getenv("EMBEDDING_MODEL_DIR", str(LOCAL_MODEL_DIR)))
            found_local = False
            if local_model.exists() and (
                (local_model / "pytorch_model.bin").exists()
                or (local_model / "model.safetensors").exists()
            ):
                print(f"Loading embedding model from local directory: {local_model}")
                self._model = SentenceTransformer(str(local_model), device=self.device)
                found_local = True

            # 2. Check dynamic Hugging Face user cache without hardcoded paths
            if not found_local:
                hf_snapshots = Path.home() / ".cache" / "huggingface" / "hub" / "models--BAAI--bge-m3" / "snapshots"
                if hf_snapshots.exists():
                    for snap in hf_snapshots.iterdir():
                        if snap.is_dir() and (
                            (snap / "pytorch_model.bin").exists()
                            or (snap / "model.safetensors").exists()
                        ):
                            print(f"Loading embedding model from local cache snapshot: {snap}")
                            self._model = SentenceTransformer(str(snap), device=self.device)
                            found_local = True
                            break

            # 3. Fallback: standard Hugging Face download/cache (for VM, Docker, or cloud deployment)
            if not found_local:
                print(f"Loading embedding model '{self.model_name}' (dim: {self.dimension})...")
                self._model = SentenceTransformer(self.model_name, device=self.device)

            # Optimize sequence length: our chunks are 900 chars (~200 tokens)
            self._model.max_seq_length = 512
        return self._model

    def embed_documents(self, texts: List[str], batch_size: int = 16) -> List[List[float]]:
        """Generates 1024-dim dense embeddings for a list of document strings."""
        if not texts:
            return []
        
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=len(texts) > 20,
            normalize_embeddings=True,
            convert_to_numpy=True
        )
        return embeddings.tolist()

    def embed_query(self, query: str) -> List[float]:
        """Generates a 1024-dim dense embedding for a single search query."""
        embedding = self.model.encode(
            query,
            normalize_embeddings=True,
            convert_to_numpy=True
        )
        return embedding.tolist()

    def __call__(self, input: Union[str, List[str]]) -> List[List[float]]:
        """ChromaDB compatible embedding function call."""
        if isinstance(input, str):
            input = [input]
        return self.embed_documents(input)
