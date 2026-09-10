import os
import re
from typing import List, Dict, Any, Optional
from rag.config import GEMINI_API_KEY, GEMINI_MODEL_NAME, DEFAULT_TOP_K
from rag.vector_store import VectorStoreManager

SYSTEM_PROMPT = """You are VidyaAI — an expert, concise, and helpful educational guidance counselor.
Your mission is to provide clear, short, yet comprehensive answers to Indian students and parents based strictly on the provided Context.

Strict Guidelines:
1. Brevity & Meaning: Keep your answer short, concise, and to-the-point without sacrificing essential facts. Never write long essays or filler intro/outro statements (like "Hello!", "Here is what you need to know", or "Hope this helps!").
2. High Information Density: Answer directly with the key facts, eligibility, criteria, procedures, or differences derived from the retrieved context.
3. Formatting: Use clean bullet points or bold highlights. Keep formatting simple, consistent, and easy to read.
4. NO BRACKET CITATIONS: Absolutely DO NOT mention source file names, paths, or citations in square brackets anywhere in your text (e.g., NEVER write "[Source: ...]", "[admission.md]", or "[1]"). Sources are provided separately by the system outside your response.
5. Honest Limitations: If the provided Context does not contain the answer, state in one brief sentence that the specific information is not available in the knowledge base.
"""

class VidyaAIRAG:
    """
    End-to-End RAG Engine combining BAAI/bge-m3 ChromaDB retrieval with Google Gemini LLM generation.
    """
    def __init__(
        self,
        vector_store: Optional[VectorStoreManager] = None,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None
    ):
        self.vector_store = vector_store or VectorStoreManager()
        self.api_key = api_key or GEMINI_API_KEY
        self.model_name = model_name or GEMINI_MODEL_NAME
        self._client = None

    @property
    def client(self):
        """Initializes the google-genai client."""
        if self._client is None and self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to initialize google-genai Client: {e}")
        return self._client

    def retrieve(
        self,
        query: str,
        top_k: int = DEFAULT_TOP_K,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves most relevant knowledge base chunks for a query."""
        return self.vector_store.search(query=query, top_k=top_k, where=filters)

    def format_context(self, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """Formats retrieved chunks into a clear prompt context block."""
        context_parts = []
        for i, chunk in enumerate(retrieved_chunks, 1):
            meta = chunk.get("metadata", {})
            title = meta.get("title", "Guide")
            source = meta.get("source", "knowledge-base")
            section = meta.get("section", "Overview")
            score = chunk.get("score", 0.0)
            
            block = (
                f"--- CONTEXT CHUNK {i} ---\n"
                f"Source: {source}\n"
                f"Title: {title} | Section: {section} (Similarity: {score})\n"
                f"Content:\n{chunk.get('text', '').strip()}\n"
            )
            context_parts.append(block)
        return "\n".join(context_parts)

    def sanitize_answer(self, text: str) -> str:
        """
        Removes any bracketed source citations, file paths, or trailing source sections
        to ensure clean, concise, and uncluttered text output.
        """
        if not text:
            return ""

        # Remove source file references in brackets like [file.md], [Source: file.md], [12-admissions/...]
        text = re.sub(r'\[(?:Source:?\s*)?[^\]]*?\.(?:md|json|txt|pdf|html|csv)[^\]]*?\]', '', text, flags=re.IGNORECASE)
        # Remove generic bracketed citations like [Source: ...], [Ref: ...]
        text = re.sub(r'\[(?:Source|Reference|Ref):\s*[^\]]+?\]', '', text, flags=re.IGNORECASE)
        # Remove footnote numbers like [1], [2], [1, 2]
        text = re.sub(r'\[\s*\d+(?:\s*,\s*\d+)*\s*\]', '', text)

        # Remove any trailing "Sources:" or "References:" section LLMs sometimes append
        text = re.sub(r'(?i)\n*(?:\*\*|__)?(?:sources?|references?):(?:\*\*|__)?[\s\S]*$', '', text)

        # Clean multiple spaces on the same line
        text = re.sub(r'[ \t]+', ' ', text)
        # Clean space before punctuation created by stripped citations
        text = re.sub(r'\s+([.,;:!?])', r'\1', text)
        # Clean excessive newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    def answer_query(
        self,
        query: str,
        top_k: int = DEFAULT_TOP_K,
        filters: Optional[Dict[str, Any]] = None,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Executes retrieval and Gemini generation for a user query.
        Returns a dict with 'answer', 'sources', and 'retrieved_chunks'.
        """
        chunks = self.retrieve(query=query, top_k=top_k, filters=filters)
        
        if not chunks:
            return {
                "answer": "I could not find relevant information in the VidyaAI knowledge base for this query. Please try rephrasing or asking about a specific stream, exam, or course.",
                "sources": [],
                "retrieved_chunks": []
            }

        context = self.format_context(chunks)

        # Assemble sources summary
        sources = []
        seen_sources = set()
        for c in chunks:
            s = c.get("metadata", {}).get("source")
            if s and s not in seen_sources:
                seen_sources.add(s)
                sources.append({
                    "title": c.get("metadata", {}).get("title", ""),
                    "source": s,
                    "category": c.get("metadata", {}).get("category", ""),
                    "section": c.get("metadata", {}).get("section", "")
                })

        # Check if Gemini API key is available
        if not self.api_key:
            return {
                "answer": (
                    "**Knowledge base retrieved successfully!**\n\n"
                    "*(Note: GEMINI_API_KEY is not configured yet. Please set your `GEMINI_API_KEY` in the `.env` file to enable AI synthesis.)*\n\n"
                    f"**Most Relevant Knowledge Base Content Found:**\n\n{chunks[0]['text']}"
                ),
                "sources": sources,
                "retrieved_chunks": chunks
            }

        # Build prompt for Gemini
        history_text = ""
        if chat_history:
            history_text = "Prior Conversation:\n"
            for msg in chat_history[-4:]:  # last 4 turns
                role = "Student" if msg.get("role") == "user" else "Advisor"
                history_text += f"{role}: {msg.get('content')}\n"
            history_text += "\n"

        prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"{history_text}"
            f"Knowledge Base Context:\n{context}\n\n"
            f"Student Question: {query}\n\n"
            f"Advisor Answer:"
        )

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            raw_answer = response.text or ""
            answer = self.sanitize_answer(raw_answer)
        except Exception as e:
            # Fallback to gemini-1.5-flash if gemini-2.5-flash is unavailable
            print(f"Error calling {self.model_name}: {e}. Retrying with gemini-1.5-flash...")
            try:
                response = self.client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt
                )
                raw_answer = response.text or ""
                answer = self.sanitize_answer(raw_answer)
            except Exception as e2:
                answer = f"Error generating answer with Gemini API: {e2}"

        return {
            "answer": answer,
            "sources": sources,
            "retrieved_chunks": chunks
        }

# Alias for backward compatibility
VidyaMargdarshakRAG = VidyaAIRAG
