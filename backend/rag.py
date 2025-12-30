import os
import requests
import pandas as pd
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi 
from pinecone import Pinecone
from supabase import create_client, Client

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("🔹 Initializing AI Models & Database...")
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
vector_store = PineconeVectorStore(index_name=PINECONE_INDEX_NAME, embedding=embeddings)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.3)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- DATABASE FUNCTIONS ---

def create_chat_session(user_id, title, source_type, source_url=None):
    try:
        data = { "user_id": user_id, "title": title, "source_type": source_type, "source_url": source_url }
        response = supabase.table("chats").insert(data).execute()
        return response.data[0]['id']
    except Exception as e:
        print(f"❌ DB Create Error: {e}")
        return None

def save_message(chat_id, role, content):
    try: supabase.table("messages").insert({"chat_id": chat_id, "role": role, "content": content}).execute()
    except Exception as e: print(f"❌ DB Save Msg Error: {e}")

def get_user_chats(user_id):
    try:
        response = supabase.table("chats").select("id, title, source_type, source_url, created_at").eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e: return []

def get_chat_details(chat_id):
    try:
        chat_meta = supabase.table("chats").select("*").eq("id", chat_id).single().execute()
        msgs = supabase.table("messages").select("*").eq("chat_id", chat_id).order("created_at", desc=True).execute()
        return { "metadata": chat_meta.data, "messages": msgs.data[::-1] }
    except Exception as e: return None

def delete_chat_session(chat_id):
    try:
        supabase.table("chats").delete().eq("id", chat_id).execute()
        return True
    except: return False

# 🔥 NEW: RENAME FUNCTION
def rename_chat_session(chat_id, new_title):
    try:
        supabase.table("chats").update({"title": new_title}).eq("id", chat_id).execute()
        return True
    except Exception as e:
        print(f"❌ Rename Error: {e}")
        return False


# ... (Purane functions ke neeche add kar)

# 🔥 NEW: Dashboard Stats
def get_dashboard_stats(user_id):
    try:
        # 1. Fetch ALL chats (lightweight query)
        response = supabase.table("chats").select("id, title, source_type, created_at").eq("user_id", user_id).order("created_at", desc=True).execute()
        chats = response.data
        
        # 2. Calculate Counts
        total_chats = len(chats)
        youtube_count = len([c for c in chats if c['source_type'] == 'youtube'])
        # PDF, Word, Excel, Code sab 'documents' hain
        doc_count = len([c for c in chats if c['source_type'] in ['pdf', 'word', 'excel', 'csv', 'code', 'file']]) 
        web_count = len([c for c in chats if c['source_type'] in ['web', 'website']])
        
        # 3. Get Recent Activity (Top 5)
        recent_activity = chats[:5]
        
        return {
            "stats": {
                "total": total_chats,
                "youtube": youtube_count,
                "documents": doc_count,
                "websites": web_count
            },
            "recent_activity": recent_activity
        }
    except Exception as e:
        print(f"❌ Dashboard Error: {e}")
        return {
            "stats": { "total": 0, "youtube": 0, "documents": 0, "websites": 0 },
            "recent_activity": []
        }

# --- PROCESSORS (With Title Extraction) ---

def split_and_store(docs):
    try:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        if not splits: return "No content."
        vector_store.add_documents(splits)
        return "Success"
    except Exception as e: return f"Pinecone Error: {str(e)}"

def process_document(file_path):
    # (Same as before)
    print(f"📄 Processing File: {file_path}")
    try:
        loader, doc_type, docs = None, "text", []
        if file_path.lower().endswith(".pdf"): loader = PyPDFLoader(file_path); doc_type = "pdf"; docs = loader.load()
        elif file_path.lower().endswith(".docx"): loader = Docx2txtLoader(file_path); doc_type = "word"; docs = loader.load()
        elif file_path.lower().endswith(".xlsx") or file_path.lower().endswith(".xls"):
            df = pd.read_excel(file_path); text = df.to_string(index=False); doc_type = "excel"
            docs = [Document(page_content=text, metadata={"source": file_path, "type": "excel"})]
        elif file_path.lower().endswith(".csv"):
            df = pd.read_csv(file_path); text = df.to_string(index=False); doc_type = "csv"
            docs = [Document(page_content=text, metadata={"source": file_path, "type": "csv"})]
        else: loader = TextLoader(file_path, encoding='utf-8', autodetect_encoding=True); doc_type = "code"; docs = loader.load()

        if not docs: return {"status": "Error", "content": "Empty file"}
        result = split_and_store(docs)
        if result == "Success":
            content_preview = "\n\n".join([d.page_content for d in docs])
            return {"status": "Success", "content": content_preview, "type": doc_type}
        return {"status": "Error", "content": result}
    except Exception as e: return {"status": "Error", "content": str(e)}

def process_youtube(video_url):
    print(f"🎥 YouTube: {video_url}")
    try:
        # 1. Get Video ID
        if "youtu.be" in video_url: vid = video_url.split("/")[-1].split("?")[0]
        elif "v=" in video_url: vid = video_url.split("v=")[-1].split("&")[0]
        else: return {"status": "Error", "detail": "Invalid URL"}

        # 2. 🔥 Fetch Real Title
        video_title = "YouTube Video"
        try:
            r = requests.get(video_url)
            soup = BeautifulSoup(r.text, 'html.parser')
            title_tag = soup.find("meta", property="og:title")
            if title_tag: video_title = title_tag["content"]
            else: video_title = soup.title.string.replace(" - YouTube", "")
        except: pass

        # 3. Get Transcript
        try:
            yt = YouTubeTranscriptApi()
            try: tx = yt.list_transcripts(vid).find_transcript(['en', 'hi'])
            except: tx = next(iter(yt.list_transcripts(vid)))
            data = tx.fetch()
            text = " ".join([i['text'] for i in data])
        except Exception as e:
            # Fallback
            try:
                data = YouTubeTranscriptApi.get_transcript(vid)
                text = " ".join([i['text'] for i in data])
            except: return {"status": "Error", "detail": "No transcript found"}

        doc = Document(page_content=text, metadata={"source": video_url, "type": "youtube"})
        split_and_store([doc])
        
        # Return Title!
        return {"status": "Success", "title": video_title}
        
    except Exception as e: return {"status": "Error", "detail": str(e)}

def process_website(url):
    print(f"🌐 Website: {url}")
    try:
        headers = { "User-Agent": "Mozilla/5.0" }
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200: return {"status": "Error", "detail": "Blocked"}

        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 🔥 Fetch Real Title
        page_title = soup.title.string.strip() if soup.title else "Website Source"
        if len(page_title) > 50: page_title = page_title[:50] + "..."

        for s in soup(["script", "style", "nav", "footer"]): s.decompose()
        text = soup.get_text(separator="\n").strip()
        
        if len(text) < 50: return {"status": "Error", "detail": "Content too short"}

        doc = Document(page_content=text, metadata={"source": url, "type": "web"})
        split_and_store([doc])
        
        # Return Title!
        return {"status": "Success", "title": page_title}

    except Exception as e: return {"status": "Error", "detail": str(e)}

def clear_database():
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        index.delete(delete_all=True)
        return True
    except: return False

# --- 🧠 CHAT LOGIC (EXACTLY YOUR PREFERRED TEMPLATE) ---
def answer_query(question):
    print(f"🤔 Thinking about: {question}")
    
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})

    # 👇 SAME TEMPLATE AS YOU REQUESTED
    template = """
    You are a highly skilled AI assistant known for producing **clear, elegant, and visually pleasing answers**.

    Your goal is to deliver responses that feel:
    - ✨ Professionally written
    - 🧠 Easy to understand
    - 🎯 Well-structured and engaging

    -------------------------------
    ### 🔒 FORMATTING RULES (VERY IMPORTANT)
    1. Use **Markdown formatting** properly.
    2. Use `###` for section headings.
    3. Use bullet points (`-`) instead of long paragraphs.
    4. Keep sentences **short, clean, and readable**.
    5. Add **bold highlights** for key ideas.
    6. Leave a **blank line between sections and bullet points**.
    7. Avoid unnecessary filler or robotic phrasing.

    -------------------------------
    ### 🧱 RESPONSE STRUCTURE (MANDATORY)

    ### 🔹 Title
    (A clear, attractive title related to the question)

    ### 🔹 Key Explanation
    - Explain the concept in **simple, friendly language**
    - Break ideas into **digestible bullets**
    - Use examples if helpful

    ### 🔹 Key Takeaways
    - 2–4 concise bullet points summarizing the answer

    ### 🔹 Final Thought
    - End with a short, confident, helpful conclusion

    -------------------------------
    ### Context:
    {context}

    ### User Question:
    {question}

    ### Answer:
    """

    prompt = ChatPromptTemplate.from_template(template)

    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain.invoke(question)