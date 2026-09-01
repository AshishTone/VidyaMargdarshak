import os
import certifi
from urllib.parse import quote_plus
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain

# Optional: Fetch API Key if running in Google Colab
try:
    from google.colab import userdata
    if "GOOGLE_API_KEY" not in os.environ and userdata.get("GOOGLE_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = userdata.get("GOOGLE_API_KEY")
except ImportError:
    pass

_rag_chain = None


def setup_rag_chain():
    global _rag_chain
    if _rag_chain is not None:
        return _rag_chain

    # 1. MongoDB Credentials & Configuration
    RAW_PASSWORD = "nGQPusm8MVQ6A8SU"
    encoded_password = quote_plus(RAW_PASSWORD)
    DEFAULT_URI = f"mongodb+srv://admin:{encoded_password}@careeradvisor.f6oqcen.mongodb.net/?retryWrites=true&w=majority&appName=CareerAdvisor"
    ATLAS_URI = os.getenv("MONGODB_URI", DEFAULT_URI)

    DB_NAME = "CareerAdvisor"
    COLLECTION_NAME = "vector_embeddings"
    INDEX_NAME = "vector_index"

    # Set HF offline env to avoid 30+ second online retry delays if hub is unreachable
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"

    # 2. Connect Vector Store
    try:
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"}
        )
    except Exception:
        # Fallback if offline mode fails
        os.environ.pop("HF_HUB_OFFLINE", None)
        os.environ.pop("TRANSFORMERS_OFFLINE", None)
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    client = MongoClient(ATLAS_URI, tlsCAFile=certifi.where())
    collection = client[DB_NAME][COLLECTION_NAME]

    vectorstore = MongoDBAtlasVectorSearch(
        collection=collection,
        embedding=embeddings,
        index_name=INDEX_NAME,
        text_key="text"
    )

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )

    # 3. LLM Setup
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    google_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    llm = ChatGoogleGenerativeAI(
        model=model_name,
        temperature=0.3,
        google_api_key=google_api_key,
        max_retries=0,
        request_timeout=8
    )

    # 4. Define Prompt Architecture
    system_prompt = (
        "You are VidyaMargdarshak - an expert Career & Education Advisor AI.\n"
        "Your mission is to provide personalized, accurate, and actionable career and education guidance.\n"
        "Use the following pieces of retrieved context from career handbooks and guidance documents to answer the question.\n"
        "If student profile information is provided, tailor your guidance specifically to their grade level, stream, and interests.\n"
        "If you don't know the answer or the context doesn't contain sufficient information, state clearly that you don't have enough specific information while offering helpful general guidance.\n\n"
        "Context:\n{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    # 5. Build RAG Chain
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    _rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return _rag_chain


def generate_knowledge_fallback(user_query: str, user_context: dict = None, docs: list = None):
    """
    Generates a structured career guidance answer using retrieved context documents 
    or curated domain knowledge when external LLM API is unavailable.
    """
    q_lower = user_query.lower()
    profile_summary = ""
    if user_context:
        p_parts = []
        if user_context.get("classLevel"):
            p_parts.append(f"Class Level: {user_context['classLevel']}")
        if user_context.get("stream"):
            p_parts.append(f"Stream: {user_context['stream']}")
        if user_context.get("interests"):
            interests = user_context["interests"]
            p_parts.append(f"Interests: {', '.join(interests) if isinstance(interests, list) else interests}")
        if p_parts:
            profile_summary = f"\n*(Tailored for: {', '.join(p_parts)})*\n"

    # 1. Use retrieved doc content if available
    context_text = ""
    doc_sources = []
    if docs:
        for doc in docs:
            text = doc.page_content if hasattr(doc, "page_content") else str(doc)
            context_text += text + "\n\n"
            meta = doc.metadata if hasattr(doc, "metadata") else {}
            doc_sources.append({
                "content": text[:300] + "..." if len(text) > 300 else text,
                "metadata": meta
            })

    # 2. Match specific career queries for domain-specific breakdown
    if "law" in q_lower or "lawyer" in q_lower or "advocate" in q_lower:
        answer = (
            f"### Becoming a Lawyer: Education & Career Guidance\n{profile_summary}\n"
            "A career in law offers strong career growth, advocacy opportunities, and diverse specializations.\n\n"
            "#### 1. Educational Path\n"
            "* **5-Year Integrated Degree (After 10th/12th):** BA LL.B., BBA LL.B., or B.Com LL.B. after clearing entrance exams like **CLAT**, **AILET**, **MH CET Law**, or **LSAT India**.\n"
            "* **3-Year LL.B. (After Graduation):** Available for students with any Bachelor's degree.\n\n"
            "#### 2. Key Specializations\n"
            "* **Corporate & Cyber Law:** Drafting contracts, intellectual property, and compliance.\n"
            "* **Litigation:** Criminal or Civil court representation.\n"
            "* **Judicial Services:** Exam path to become a magistrate or judge.\n\n"
            "#### 3. Essential Skills & Licensing\n"
            "* Pass the **All India Bar Examination (AIBE)** to practice after graduation.\n"
            "* Focus on logical reasoning, analytical reading, research, and public speaking."
        )
    elif "engineer" in q_lower or "b.tech" in q_lower or "btech" in q_lower or "cs" in q_lower:
        answer = (
            f"### Engineering & Technology Career Path\n{profile_summary}\n"
            "Engineering offers diverse domain opportunities in Software Development, Artificial Intelligence, Robotics, and Civil/Mechanical branches.\n\n"
            "#### 1. Entrance Exams & Eligibility\n"
            "* **Prerequisites:** Physics, Chemistry & Mathematics (PCM) in 10+2.\n"
            "* **Major Entrance Exams:** JEE Main, JEE Advanced, MHT-CET, BITSAT, VITEEE.\n\n"
            "#### 2. Popular Degree Paths\n"
            "* **B.Tech / B.E. (4 Years):** Computer Science, AI & ML, Electronics, Civil, Mechanical.\n"
            "* **BCA / B.Sc Computer Science (3 Years):** Alternative application-focused paths."
        )
    elif "doctor" in q_lower or "medical" in q_lower or "neet" in q_lower or "mbbs" in q_lower:
        answer = (
            f"### Medical & Healthcare Career Pathways\n{profile_summary}\n"
            "Healthcare and medicine provide rewarding careers dedicated to diagnosis, patient care, and medical research.\n\n"
            "#### 1. Primary Path\n"
            "* **Eligibility:** Physics, Chemistry & Biology (PCB) in 10+2.\n"
            "* **Entrance Exam:** **NEET UG** (National Eligibility Entrance Test).\n"
            "* **Degree Options:** MBBS (5.5 yrs), BDS (Dental), BAMS (Ayurveda), BHMS (Homeopathy).\n\n"
            "#### 2. Allied Health Professions\n"
            "* B.Sc Nursing, B.Pharm (Pharmacy), Physiotherapy (BPT), Biotechnology."
        )
    elif context_text.strip():
        answer = (
            f"### VidyaMargdarshak Career Guidance\n{profile_summary}\n"
            f"{context_text.strip()[:1000]}"
        )
    else:
        answer = (
            f"### Personalized Career & Education Guidance\n{profile_summary}\n"
            f"Regarding your query on **\"{user_query}\"**:\n\n"
            "1. **Academic Planning:** Evaluate core subject requirements and recommended streams (Science, Commerce, or Arts).\n"
            "2. **Skill Building:** Develop critical thinking, communication, and hands-on domain experience.\n"
            "3. **Entrance & Degree Requirements:** Explore national and state entrance exams relevant to your class level.\n\n"
            "Feel free to ask more specific questions about streams, entrance exams, courses, or college shortlists!"
        )

    return {
        "answer": answer,
        "sources": doc_sources
    }


def query_rag(user_query: str, user_context: dict = None):
    formatted_query = user_query
    if user_context:
        details = []
        if user_context.get("classLevel"):
            details.append(f"Grade/Class: {user_context['classLevel']}")
        if user_context.get("stream"):
            details.append(f"Target Stream: {user_context['stream']}")
        if user_context.get("interests") and isinstance(user_context["interests"], list):
            details.append(f"Interests: {', '.join(user_context['interests'])}")
        if user_context.get("language"):
            details.append(f"Preferred Language: {user_context['language']}")
            
        if details:
            formatted_query = f"[Student Profile Context: {'; '.join(details)}]\nStudent Question: {user_query}"

    try:
        chain = setup_rag_chain()
        response = chain.invoke({"input": formatted_query})

        sources = []
        if "context" in response and response["context"]:
            for doc in response["context"]:
                doc_info = {
                    "content": doc.page_content[:300] + "..." if len(doc.page_content) > 300 else doc.page_content,
                    "metadata": doc.metadata if hasattr(doc, "metadata") else {}
                }
                sources.append(doc_info)

        return {
            "answer": response.get("answer", ""),
            "sources": sources
        }
    except Exception as err:
        import sys
        print(f"[!] RAG Chain LLM invocation warning: {err}. Using instant fallback synthesis...", file=sys.stderr)
        return generate_knowledge_fallback(user_query, user_context)


def main():
    print("Initializing VidyaMargdarshak Career Advisor RAG Application...")
    print("[+] System Ready! Ask a question or type 'exit' to quit.\n")

    while True:
        user_query = input("Ask Career Advisor: ")
        if user_query.lower() in ["exit", "quit", "q"]:
            print("Exiting RAG system. Goodbye!")
            break

        if not user_query.strip():
            continue

        print("\nSearching database and generating response...")
        try:
            result = query_rag(user_query)
            print("\n--- Career Advisor Response ---")
            print(result["answer"])
            if result.get("sources"):
                print("\n[Sources Retrieved]:")
                for idx, src in enumerate(result["sources"], 1):
                    print(f"  {idx}. {src['content'][:100]}...")
            print("-" * 32 + "\n")
        except Exception as e:
            print(f"\n[Error] Failed to generate response: {e}\n")


if __name__ == "__main__":
    main()