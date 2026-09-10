import os
import json
from pathlib import Path
from typing import List, Dict, Any
from rag.config import KB_DIR
from rag.metadata_extractor import extract_markdown_metadata, normalize_list_value

class Document:
    def __init__(self, page_content: str, metadata: Dict[str, Any]):
        self.page_content = page_content
        self.metadata = metadata

    def __repr__(self):
        return f"Document(title='{self.metadata.get('title')}', source='{self.metadata.get('source')}')"

def load_json_directory(file_path: Path, kb_root: Path) -> List[Document]:
    """Loads course-directory.json and turns each course item into a searchable document."""
    rel_path = str(file_path.relative_to(kb_root)).replace("\\", "/")
    docs = []
    
    try:
        with open(file_path, "r", encoding="utf-8-sig") as fp:
            data = json.load(fp)
            
        courses = data.get("courses", [])
        for c in courses:
            title = c.get("title", "Course")
            cid = c.get("id", "course")
            level = c.get("level", "general")
            duration = c.get("duration", "")
            entry_after = c.get("entry_after", "")
            streams = normalize_list_value(c.get("streams", []))
            domain = normalize_list_value(c.get("domain", []))
            specializations = normalize_list_value(c.get("specializations", []))
            careers = normalize_list_value(c.get("related_careers", []))
            exams = normalize_list_value(c.get("entrance_exams", []))
            reg_body = c.get("regulatory_body", "")
            doc_file = c.get("file_path", "")
            
            content = (
                f"# Course: {title} ({cid})\n"
                f"- **Level**: {level}\n"
                f"- **Duration**: {duration}\n"
                f"- **Entry Requirement**: After {entry_after}\n"
                f"- **Streams**: {streams}\n"
                f"- **Domains**: {domain}\n"
                f"- **Specializations**: {specializations}\n"
                f"- **Related Careers**: {careers}\n"
                f"- **Entrance Exams**: {exams}\n"
                f"- **Regulatory Body**: {reg_body}\n"
                f"- **Full Guide**: {doc_file}\n"
            )
            
            meta = {
                "doc_id": cid,
                "title": title,
                "category": "courses",
                "subcategory": "course-directory",
                "stream": streams or domain or "Any",
                "education_level": level or f"after-{entry_after}",
                "year": "2025-2026",
                "source": rel_path,
                "tags": f"course, directory, {domain}, {streams}",
            }
            docs.append(Document(page_content=content, metadata=meta))
    except Exception as e:
        print(f"Error loading JSON file {file_path}: {e}")
        
    return docs

def load_all_documents(kb_root: Path = KB_DIR) -> List[Document]:
    """
    Recursively scans the knowledge base directory and loads all markdown and json files.
    """
    documents: List[Document] = []
    
    if not kb_root.exists():
        raise FileNotFoundError(f"Knowledge base directory not found at: {kb_root}")
        
    all_files = sorted(list(kb_root.rglob("*")))
    
    md_count = 0
    json_count = 0
    
    for file_path in all_files:
        if not file_path.is_file():
            continue
            
        ext = file_path.suffix.lower()
        if ext == ".md":
            try:
                meta, body = extract_markdown_metadata(file_path, kb_root)
                documents.append(Document(page_content=body, metadata=meta))
                md_count += 1
            except Exception as e:
                print(f"Error parsing Markdown {file_path}: {e}")
        elif ext == ".json":
            try:
                json_docs = load_json_directory(file_path, kb_root)
                documents.extend(json_docs)
                json_count += 1
            except Exception as e:
                print(f"Error parsing JSON {file_path}: {e}")

    print(f"Loaded {md_count} Markdown files and {json_count} JSON directories -> Total {len(documents)} base documents.")
    return documents
