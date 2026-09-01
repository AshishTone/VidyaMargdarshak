import sys
import json
import os
import base64
from dotenv import load_dotenv

os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

load_dotenv()

from rag_app import query_rag

def main():
    try:
        query = ""
        user_context = None

        if len(sys.argv) > 1:
            raw_arg = sys.argv[1].strip()
            payload = None
            try:
                decoded = base64.b64decode(raw_arg).decode("utf-8")
                payload = json.loads(decoded)
            except Exception:
                try:
                    payload = json.loads(raw_arg)
                except Exception:
                    payload = {"query": raw_arg}

            if isinstance(payload, dict):
                query = payload.get("query", "")
                user_context = payload.get("user_context", None)
            else:
                query = str(payload)
        else:
            input_data = sys.stdin.read().strip()
            try:
                payload = json.loads(input_data)
                query = payload.get("query", "")
                user_context = payload.get("user_context", None)
            except Exception:
                query = input_data

        if not query:
            print(json.dumps({"success": False, "error": "No query provided"}), flush=True)
            sys.exit(1)

        result = query_rag(query, user_context)
        output = {
            "success": True,
            "answer": result["answer"],
            "sources": result.get("sources", [])
        }
        print(json.dumps(output), flush=True)
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}), flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
