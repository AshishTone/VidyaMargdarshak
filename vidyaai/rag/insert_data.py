import os
import glob
import certifi
from urllib.parse import quote_plus
from pymongo import MongoClient
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch

load_dotenv()

# Optional: Import Google Colab tools if running in Google Colab environment
try:
    from google.colab import files
    IN_COLAB = True
except ImportError:
    IN_COLAB = False


def load_documents():
    """Loads PDF documents from pdfs directory, Google Colab upload, or creates fallback text documents."""
    docs = []
    
    if IN_COLAB:
        print("Please upload your PDF document(s):")
        uploaded = files.upload()
        for fn in uploaded.keys():
            print(f"Processing uploaded file: '{fn}'")
            with open(fn, 'wb') as f:
                f.write(uploaded[fn])
            loader = PyPDFLoader(fn)
            docs.extend(loader.load())

    # Look for local PDFs in the 'pdfs' directory relative to script or cwd
    pdf_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pdfs")
    if os.path.exists(pdf_dir):
        pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))
        if pdf_files:
            print(f"Found {len(pdf_files)} PDF file(s) in '{pdf_dir}':")
            for pdf_path in pdf_files:
                print(f" - Loading '{os.path.basename(pdf_path)}'...")
                try:
                    loader = PyPDFLoader(pdf_path)
                    loaded_docs = loader.load()
                    docs.extend(loaded_docs)
                    print(f"   Loaded {len(loaded_docs)} pages.")
                except Exception as e:
                    print(f"   [Error] Failed to load {pdf_path}: {e}")

    if not docs:
        print("No PDF documents found. Initializing with default dataset...")
        docs = [Document(page_content="""
        Career opportunities in India for 10th pass students include vocational courses like ITI, polytechnic diplomas, and certificate courses in fields such as electrician, plumber, and beautician. Government jobs like railway group D and police constable are also options.

        For 12th pass students, options diversify into undergraduate degrees (B.Tech, B.Sc, B.Com, B.A), paramedical courses, defense services, and various diploma programs. Entrance exams like NEET (medical), JEE (engineering), and CLAT (law) are crucial for higher education.

        Graduate students have a wide array of career paths, including corporate jobs in IT, finance, marketing, and human resources. Higher education options include MBA, M.Tech, M.Sc, and Ph.D. Government civil services exams (UPSC, PSC) and public sector undertakings (PSUs) are highly sought after. Emerging fields like data science, AI, and cybersecurity also offer significant opportunities.
        """)]

    print(f"Loaded total {len(docs)} document page(s).")
    return docs


def main():
    # 1. MongoDB Credentials & Configuration
    RAW_PASSWORD = "nGQPusm8MVQ6A8SU"
    encoded_password = quote_plus(RAW_PASSWORD)
    DEFAULT_URI = f"mongodb+srv://admin:{encoded_password}@careeradvisor.f6oqcen.mongodb.net/?retryWrites=true&w=majority&appName=CareerAdvisor"
    ATLAS_URI = os.getenv("MONGODB_URI", DEFAULT_URI)

    DB_NAME = "CareerAdvisor"
    COLLECTION_NAME = "vector_embeddings"
    INDEX_NAME = "vector_index"

    # 2. Document Processing
    docs = load_documents()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    print(f"Split documents into {len(splits)} text chunks.")

    # 3. Initialize Embedding Model
    print("Initializing embedding model (sentence-transformers/all-MiniLM-L6-v2)...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    # 4. Connect to MongoDB Atlas
    client = MongoClient(ATLAS_URI, tlsCAFile=certifi.where())
    collection = client[DB_NAME][COLLECTION_NAME]

    # 5. Embed Chunks and Ingest into MongoDB Vector Store
    print(f"Uploading vectors to MongoDB collection '{DB_NAME}.{COLLECTION_NAME}'...")
    vectorstore_mongodb = MongoDBAtlasVectorSearch.from_documents(
        documents=splits,
        embedding=embeddings,
        collection=collection,
        index_name=INDEX_NAME,
        text_key="text"
    )

    print("[SUCCESS] Ingestion complete! Data and vector embeddings are stored successfully.")


if __name__ == "__main__":
    main()