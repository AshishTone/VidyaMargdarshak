import re
from typing import List, Dict, Any
from rag.document_loader import Document
from rag.config import CHUNK_SIZE, CHUNK_OVERLAP

class Chunk:
    def __init__(self, text: str, metadata: Dict[str, Any]):
        self.text = text
        self.metadata = metadata

    def __repr__(self):
        return f"Chunk(id='{self.metadata.get('chunk_id')}', title='{self.metadata.get('title')}', len={len(self.text)})"

def recursive_split_text(text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
    """
    Recursively splits text using natural separators until each chunk is within chunk_size.
    """
    if len(text) <= chunk_size:
        return [text.strip()] if text.strip() else []

    separators = ["\n\n", "\n", ". ", "; ", ", ", " "]
    chosen_sep = ""
    for sep in separators:
        if sep in text:
            chosen_sep = sep
            break

    if not chosen_sep:
        # Fallback to hard character slicing with overlap
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunks.append(text[start:end].strip())
            start += chunk_size - chunk_overlap
        return [c for c in chunks if c]

    parts = text.split(chosen_sep)
    chunks = []
    current_chunk = []
    current_length = 0

    for part in parts:
        part_len = len(part) + len(chosen_sep)
        if current_length + part_len > chunk_size and current_chunk:
            combined = chosen_sep.join(current_chunk).strip()
            if combined:
                chunks.append(combined)
            
            # Form overlap from the trailing parts
            overlap_parts = []
            overlap_len = 0
            for prev_part in reversed(current_chunk):
                if overlap_len + len(prev_part) + len(chosen_sep) <= chunk_overlap:
                    overlap_parts.insert(0, prev_part)
                    overlap_len += len(prev_part) + len(chosen_sep)
                else:
                    break
            current_chunk = overlap_parts + [part]
            current_length = sum(len(p) + len(chosen_sep) for p in current_chunk)
        else:
            current_chunk.append(part)
            current_length += part_len

    if current_chunk:
        combined = chosen_sep.join(current_chunk).strip()
        if combined:
            chunks.append(combined)

    return chunks

def split_markdown_by_sections(content: str) -> List[Dict[str, str]]:
    """
    Splits markdown content into sections based on ## and ### headers.
    Returns a list of dicts: [{"heading": "...", "content": "..."}].
    """
    lines = content.splitlines()
    sections = []
    current_heading = "Introduction"
    current_lines = []

    for line in lines:
        header_match = re.match(r'^(#{1,3})\s+(.+)$', line)
        if header_match:
            if current_lines:
                sec_text = "\n".join(current_lines).strip()
                if sec_text:
                    sections.append({"heading": current_heading, "content": sec_text})
                current_lines = []
            current_heading = header_match.group(2).strip()
            current_lines.append(line)
        else:
            current_lines.append(line)

    if current_lines:
        sec_text = "\n".join(current_lines).strip()
        if sec_text:
            sections.append({"heading": current_heading, "content": sec_text})

    return sections

def chunk_document(doc: Document, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP) -> List[Chunk]:
    """
    Chunks a single document using markdown-aware section splitting and recursive character chunking.
    Prepends context breadcrumbs for embedding precision.
    """
    sections = split_markdown_by_sections(doc.page_content)
    chunks: List[Chunk] = []
    chunk_index = 0

    title = doc.metadata.get("title", "Guide")
    category = doc.metadata.get("category", "")
    base_id = doc.metadata.get("doc_id", "doc")

    for sec in sections:
        heading = sec["heading"]
        sec_content = sec["content"]

        sub_chunks = recursive_split_text(sec_content, chunk_size, chunk_overlap)
        for sc in sub_chunks:
            if not sc.strip():
                continue

            # Context prefix for high-accuracy embedding retrieval
            context_prefix = f"[Document: {title} | Category: {category} | Section: {heading}]\n"
            enriched_text = context_prefix + sc

            chunk_meta = dict(doc.metadata)
            chunk_meta["chunk_id"] = f"{base_id}_c{chunk_index}"
            chunk_meta["section"] = heading
            
            chunks.append(Chunk(text=enriched_text, metadata=chunk_meta))
            chunk_index += 1

    return chunks

def chunk_all_documents(documents: List[Document], chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP) -> List[Chunk]:
    """
    Chunks all loaded documents and returns a flat list of Chunks ready for vector indexing.
    """
    all_chunks: List[Chunk] = []
    for doc in documents:
        doc_chunks = chunk_document(doc, chunk_size, chunk_overlap)
        all_chunks.extend(doc_chunks)
    return all_chunks
