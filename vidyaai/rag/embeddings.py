import os
from typing import List, Union
import numpy as np
from rag.config import EMBEDDING_MODEL_NAME, EMBEDDING_DIM

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
            print(f"Loading embedding model '{self.model_name}' (dim: {self.dimension})...")
            from sentence_transformers import SentenceTransformer
            import torch

            if self.device is None:
                self.device = "cuda" if torch.cuda.is_available() else "cpu"
                
            print(f"Using device: {self.device}")
            import os
            snapshot_dir = r"C:\Users\lenovo\.cache\huggingface\hub\models--BAAI--bge-m3\snapshots\5617a9f61b028005a4858fdac845db406aefb181"
            if os.path.exists(os.path.join(snapshot_dir, "pytorch_model.bin")):
                print(f"Loading directly from local cache snapshot: {snapshot_dir}")
                self._model = SentenceTransformer(snapshot_dir, device=self.device)
            else:
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
