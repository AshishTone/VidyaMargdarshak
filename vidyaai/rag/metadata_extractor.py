import os
import re
from pathlib import Path
from typing import Dict, Any, Tuple
import yaml

CATEGORY_MAP = {
    "01-courses": "courses",
    "02-careers": "careers",
    "03-government-exams": "government-exams",
    "04-colleges": "colleges",
    "04-higher-education": "higher-education",
    "05-entrance-exams": "entrance-exams",
    "06-skills": "skills",
    "07-industries": "industries",
    "08-certifications": "certifications",
    "09-entrepreneurship": "entrepreneurship",
    "10-scholarships": "scholarships",
    "11-career-pathways": "career-pathways",
    "12-admissions": "admissions",
    "13-eligibility": "eligibility",
    "14-maharashtra-education": "maharashtra-education",
    "15-documents-certificates": "documents-certificates",
    "16-fees-financial-aid": "fees-financial-aid",
    "17-student-faqs": "student-faqs",
    "18-course-comparisons": "course-comparisons",
    "19-admission-procedures": "admission-procedures",
    "20-deadlines": "deadlines",
    "21. vidyamargdarshak-platform": "platform",
    "21-vidyamargdarshak-platform": "platform",
}

def normalize_list_value(val: Any) -> str:
    """Ensure metadata values are converted to comma-separated strings for ChromaDB compatibility."""
    if val is None:
        return ""
    if isinstance(val, list):
        return ", ".join(str(item).strip() for item in val if item is not None)
    return str(val).strip()

def infer_category_and_subcategory(rel_path: str) -> Tuple[str, str]:
    """Infers category and subcategory from the relative folder hierarchy."""
    parts = Path(rel_path).parts
    if not parts:
        return "general", ""
    
    top_dir = parts[0]
    category = CATEGORY_MAP.get(top_dir, top_dir.lower())
    
    subcategory = ""
    if len(parts) > 2:
        subcategory = parts[1]
    elif len(parts) == 2:
        subcategory = Path(parts[1]).stem
    
    return category, subcategory

def infer_education_level(text: str, rel_path: str, frontmatter: Dict[str, Any]) -> str:
    """Infers education level from frontmatter, markdown patterns, or path hierarchy."""
    if frontmatter.get("level"):
        return normalize_list_value(frontmatter["level"])
    if frontmatter.get("entry_after"):
        return f"after-{frontmatter['entry_after']}"
    if frontmatter.get("eligible_qualifications"):
        return normalize_list_value(frontmatter["eligible_qualifications"])
    
    # Check in text
    edu_match = re.search(r'\*\*Education level:\*\*\s*([^\n\r]+)', text, re.IGNORECASE)
    if edu_match:
        return edu_match.group(1).strip()
        
    for_match = re.search(r'\*\*For:\*\*\s*([^\n\r]+)', text, re.IGNORECASE)
    if for_match:
        return for_match.group(1).strip()

    # Path heuristics
    path_lower = rel_path.lower()
    if "after-10th" in path_lower or "10th" in path_lower or "polytechnic" in path_lower or "iti" in path_lower:
        return "after-10th"
    if "after-12th" in path_lower or "12th" in path_lower or "fyjc" in path_lower:
        return "after-12th"
    if "undergraduate" in path_lower or "ug" in path_lower or "btech" in path_lower or "bca" in path_lower or "bcom" in path_lower or "ba" in path_lower:
        return "undergraduate"
    if "postgraduate" in path_lower or "masters" in path_lower or "pg" in path_lower or "mba" in path_lower:
        return "postgraduate"
    if "diploma" in path_lower:
        return "diploma"
    
    return "general"

def infer_stream(text: str, rel_path: str, frontmatter: Dict[str, Any]) -> str:
    """Infers stream from frontmatter, markdown patterns, or path hierarchy."""
    if frontmatter.get("streams"):
        return normalize_list_value(frontmatter["streams"])
    if frontmatter.get("domain"):
        return normalize_list_value(frontmatter["domain"])
        
    # Check in text
    stream_match = re.search(r'\*\*(?:Eligible )?streams?:\*\*\s*([^\n\r]+)', text, re.IGNORECASE)
    if stream_match:
        return stream_match.group(1).strip()
        
    stream_name_match = re.search(r'\|\s*\*\*Stream Name\*\*\s*\|\s*([^|]+)\|', text, re.IGNORECASE)
    if stream_name_match:
        return stream_name_match.group(1).strip()

    # Path heuristics
    path_lower = rel_path.lower()
    if "science" in path_lower:
        return "Science"
    if "commerce" in path_lower:
        return "Commerce"
    if "arts" in path_lower or "humanities" in path_lower:
        return "Arts/Humanities"
    if "engineering" in path_lower or "computer" in path_lower or "tech" in path_lower:
        return "Engineering/Technology"
    if "medical" in path_lower or "medicine" in path_lower:
        return "Medicine/Healthcare"
        
    return "Any/All"

def infer_year(text: str, frontmatter: Dict[str, Any]) -> str:
    """Infers academic or update year."""
    if frontmatter.get("last_updated"):
        val = str(frontmatter["last_updated"]).strip()
        # Extract 4-digit year if present
        m = re.search(r'20\d{2}', val)
        return m.group(0) if m else val
        
    # Text patterns
    date_match = re.search(r'(?:Last Updated|Academic Year|Date):\s*([A-Za-z0-9\s,\-]+)', text, re.IGNORECASE)
    if date_match:
        val = date_match.group(1).strip()
        m = re.search(r'20\d{2}', val)
        return m.group(0) if m else val
        
    return "2025-2026"

def extract_markdown_metadata(file_path: Path, kb_root: Path) -> Tuple[Dict[str, Any], str]:
    """
    Parses a Markdown file, extracts YAML frontmatter if present,
    and returns (metadata_dict, clean_markdown_body).
    """
    rel_path = str(file_path.relative_to(kb_root)).replace("\\", "/")
    
    with open(file_path, "r", encoding="utf-8-sig", errors="ignore") as fp:
        raw_content = fp.read().strip()
        
    frontmatter: Dict[str, Any] = {}
    body = raw_content
    
    if raw_content.startswith("---"):
        parts = raw_content.split("---", 2)
        if len(parts) >= 3:
            try:
                parsed = yaml.safe_load(parts[1])
                if isinstance(parsed, dict):
                    frontmatter = parsed
                    body = parts[2].strip()
            except Exception:
                body = raw_content

    # Title extraction
    title = frontmatter.get("title")
    if not title:
        m = re.search(r'^#\s+(.+)$', body, re.MULTILINE)
        if m:
            title = m.group(1).strip()
        else:
            title = file_path.stem.replace("-", " ").title()
            
    category, subcategory = infer_category_and_subcategory(rel_path)
    education_level = infer_education_level(body, rel_path, frontmatter)
    stream = infer_stream(body, rel_path, frontmatter)
    year = infer_year(body, frontmatter)
    
    doc_id = str(frontmatter.get("id", f"{category}_{file_path.stem}"))
    tags = normalize_list_value(frontmatter.get("tags", []))
    if not tags:
        tags = f"{category}, {subcategory}, {stream}"

    metadata = {
        "doc_id": doc_id,
        "title": str(title),
        "category": category,
        "subcategory": subcategory,
        "stream": stream,
        "education_level": education_level,
        "year": year,
        "source": rel_path,
        "tags": tags,
    }
    
    return metadata, body
