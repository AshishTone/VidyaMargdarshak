import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from tqdm import tqdm

from rag.config import CHROMA_PERSIST_DIR, COLLECTION_NAME
from rag.chunking import Chunk
from rag.embeddings import BgeM3Embeddings

class VectorStoreManager:
    """
    Manages persistent ChromaDB vector storage and semantic retrieval for VidyaMargdarshak.
    """
    def __init__(
        self,
        persist_dir: Path = CHROMA_PERSIST_DIR,
        collection_name: str = COLLECTION_NAME,
        embedder: Optional[BgeM3Embeddings] = None
    ):
        self.persist_dir = Path(persist_dir)
        self.collection_name = collection_name
        self.embedder = embedder or BgeM3Embeddings()
        
        # Ensure persistence directory exists
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize persistent client
        self.client = chromadb.PersistentClient(
            path=str(self.persist_dir),
            settings=Settings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def count(self) -> int:
        """Returns total number of chunks indexed in the collection."""
        return self.collection.count()

    def reset_collection(self):
        """Deletes and recreates the collection."""
        try:
            self.client.delete_collection(self.collection_name)
        except Exception:
            pass
        self.collection = self.client.create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def add_chunks(self, chunks: List[Chunk], batch_size: int = 32):
        """
        Computes embeddings in batches and indexes chunks into ChromaDB with incremental resume support.
        """
        if not chunks:
            print("No chunks provided for indexing.")
            return

        total_input = len(chunks)
        existing_count = self.collection.count()
        if existing_count > 0:
            print(f"Collection currently has {existing_count} chunks. Checking for duplicates...")
            existing_ids = set()
            offset = 0
            while True:
                existing_batch = self.collection.get(limit=5000, offset=offset)
                if not existing_batch or not existing_batch["ids"]:
                    break
                existing_ids.update(existing_batch["ids"])
                offset += 5000
                if len(existing_batch["ids"]) < 5000:
                    break
            
            chunks = [c for c in chunks if c.metadata["chunk_id"] not in existing_ids]
            print(f"-> Skipped {total_input - len(chunks)} already-indexed chunks. {len(chunks)} new chunks to process.")

        if not chunks:
            print("All chunks are already indexed in ChromaDB!")
            return

        total = len(chunks)
        print(f"Indexing {total} chunks into ChromaDB collection '{self.collection_name}' (batch_size={batch_size})...")

        for i in tqdm(range(0, total, batch_size), desc="Embedding & Storing Chunks"):
            batch = chunks[i:i + batch_size]
            
            ids = [c.metadata["chunk_id"] for c in batch]
            documents = [c.text for c in batch]
            metadatas = [c.metadata for c in batch]
            
            # Compute 1024-dim BAAI/bge-m3 embeddings
            embeddings = self.embedder.embed_documents(documents, batch_size=batch_size)
            
            # Add to ChromaDB
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )

        print(f"Successfully indexed. Total collection count: {self.count()} chunks.")

    def search(
        self,
        query: str,
        top_k: int = 6,
        where: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Performs cosine semantic similarity search over indexed chunks.
        Returns a list of matched chunk records with score and metadata.
        """
        query_embedding = self.embedder.embed_query(query)
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where
        )

        matched_items = []
        if not results or not results["documents"] or not results["documents"][0]:
            return matched_items

        docs = results["documents"][0]
        metas = results["metadatas"][0] if results["metadatas"] else [{}] * len(docs)
        distances = results["distances"][0] if results["distances"] else [0.0] * len(docs)
        ids = results["ids"][0] if results["ids"] else [""] * len(docs)

        for doc_text, meta, dist, cid in zip(docs, metas, distances, ids):
            # For cosine distance in chromadb, similarity score = 1.0 - distance
            similarity = max(0.0, min(1.0, 1.0 - dist))
            matched_items.append({
                "chunk_id": cid,
                "text": doc_text,
                "metadata": meta,
                "distance": dist,
                "score": round(similarity, 4)
            })

        return matched_items
