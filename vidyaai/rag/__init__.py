"""
VidyaAI RAG System Package
"""
import sys
from pathlib import Path

# Ensure vidyaai directory is on sys.path so rag.* submodules resolve anywhere
_vidyaai_dir = str(Path(__file__).resolve().parent.parent)
if _vidyaai_dir not in sys.path:
    sys.path.insert(0, _vidyaai_dir)

__version__ = "1.0.0"
