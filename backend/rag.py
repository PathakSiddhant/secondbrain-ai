import os
import re
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

# Configuration
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

# --- STORAGE ---
def upload_file_to_storage(file_path, file_name):
    """Uploads file and returns DIRECT Public URL."""
    try:
        # Sanitize name
        safe_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', file_name)
        with open(file_path, "rb") as f:
            supabase.storage.from_("documents").upload(safe_name, f, {"content-type": "auto", "upsert": "true"})
        
        # Construct Public URL manually to ensure it works
        project_id = SUPABASE_URL.split("//")[1].split(".")[0]
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/documents/{safe_name}"
        return public_url
    except Exception as e:
        print(f"⚠️ Storage Error: {e}")
        return None

# --- DATABASE ---
def create_chat_session(user_id, title, source_type, source_url=None, content=None):
    try:
        data = { "user_id": user_id, "title": title, "source_type": source_type, "source_url": source_url, "content": content }
        response = supabase.table("chats").insert(data).execute()
        if response.data: return response.data[0]['id']
        return None
    except Exception as e: print(f"❌ DB Error: {e}"); return None

def save_message(chat_id, role, content):
    try: supabase.table("messages").insert({"chat_id": chat_id, "role": role, "content": content}).execute()
    except: pass

def get_user_chats(user_id):
    try:
        response = supabase.table("chats").select("id, title, source_type, source_url, created_at").eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data
    except: return []

def get_chat_details(chat_id):
    try:
        chat_query = supabase.table("chats").select("*").eq("id", chat_id).execute()
        if not chat_query.data: return None
        chat_meta = chat_query.data[0]
        msgs_query = supabase.table("messages").select("*").eq("chat_id", chat_id).order("created_at", desc=True).execute()
        return { "metadata": chat_meta, "messages": msgs_query.data[::-1] if msgs_query.data else [] }
    except: return None

def delete_chat_session(chat_id):
    try:
        supabase.table("messages").delete().eq("chat_id", chat_id).execute()
        supabase.table("chats").delete().eq("id", chat_id).execute()
        return True
    except: return False

def rename_chat_session(chat_id, new_title):
    try:
        supabase.table("chats").update({"title": new_title}).eq("id", chat_id).execute()
        return True
    except: return False

def get_dashboard_stats(user_id):
    try:
        response = supabase.table("chats").select("id, source_type").eq("user_id", user_id).execute()
        chats = response.data
        return {
            "stats": {
                "total": len(chats),
                "youtube": len([c for c in chats if c['source_type'] == 'youtube']),
                "documents": len([c for c in chats if c['source_type'] in ['pdf', 'word', 'excel', 'file']]),
                "websites": len([c for c in chats if c['source_type'] in ['web', 'website']])
            },
            "recent_activity": []
        }
    except: return {"stats": {"total":0}, "recent_activity": []}

def get_knowledge_graph(user_id):
    try:
        response = supabase.table("chats").select("id, title, source_type").eq("user_id", user_id).execute()
        chats = response.data
        nodes = [{"id": "brain", "name": "Brain", "val": 20, "color": "#6366f1"}]
        links = []
        for chat in chats:
            color = "#ef4444" if chat['source_type'] == 'youtube' else "#3b82f6"
            nodes.append({"id": chat['id'], "name": chat['title'], "val": 10, "color": color})
            links.append({"source": "brain", "target": chat['id']})
        return {"nodes": nodes, "links": links}
    except: return {"nodes": [], "links": []}

# --- PROCESSORS ---
def split_and_store(docs):
    try:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        if not splits: return "No content extracted."
        vector_store.add_documents(splits)
        return "Success"
    except Exception as e: return f"Pinecone Error: {str(e)}"

def process_document(file_path, original_filename):
    print(f"📄 Processing: {file_path}")
    try:
        # 1. Upload
        public_url = upload_file_to_storage(file_path, original_filename)
        
        # 2. Extract
        loader, doc_type, docs = None, "text", []
        
        if file_path.endswith(".pdf"): loader = PyPDFLoader(file_path); doc_type = "pdf"
        elif file_path.endswith(".docx"): loader = Docx2txtLoader(file_path); doc_type = "word"
        elif file_path.endswith((".xlsx", ".xls")):
            doc_type = "excel"
            try:
                xls = pd.ExcelFile(file_path)
                full_text = ""
                for sheet in xls.sheet_names:
                    df = pd.read_excel(file_path, sheet_name=sheet)
                    full_text += f"\n--- {sheet} ---\n" + df.to_string(index=False)
                docs = [Document(page_content=full_text, metadata={"type": "excel"})]
            except: pass
        elif file_path.endswith(".csv"):
            doc_type = "csv"
            try:
                df = pd.read_csv(file_path)
                docs = [Document(page_content=df.to_string(index=False), metadata={"type": "csv"})]
            except: pass
        elif file_path.endswith((".txt", ".md", ".py", ".js")): 
            loader = TextLoader(file_path, encoding='utf-8'); doc_type = "code"
        
        if loader: 
            try: docs = loader.load()
            except: pass 
        
        if not docs: return {"status": "Error", "content": "File is empty or unreadable."}
        
        split_and_store(docs)
        content_preview = "\n\n".join([d.page_content for d in docs])
        
        return {"status": "Success", "content": content_preview, "type": doc_type, "url": public_url}
    except Exception as e: return {"status": "Error", "content": str(e)}

def process_youtube(video_url):
    try:
        # Get ID
        regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
        match = re.search(regex, video_url)
        if not match: return {"status": "Error", "detail": "Invalid YouTube URL"}
        vid = match.group(1)
        
        # Fetch Metadata (Title)
        title = "YouTube Video"
        try:
            r = requests.get(f"https://www.youtube.com/watch?v={vid}")
            soup = BeautifulSoup(r.text, 'html.parser')
            title = soup.title.string.replace(" - YouTube", "")
        except: pass

        # 🔥 NOTEGPT LOGIC: Try EVERY available transcript
        text = ""
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(vid)
            # Try to get English or Hindi, or translate
            try:
                transcript = transcript_list.find_transcript(['en', 'hi'])
            except:
                # If not found, get any and translate to english
                transcript = transcript_list.find_generated_transcript(['en', 'hi'])
            
            transcript_data = transcript.fetch()
            text = " ".join([i['text'] for i in transcript_data])
        except Exception as e:
            print(f"⚠️ Transcript Failed: {e}")
            text = f"Video Title: {title}. (Transcript not available via API. Answer based on general knowledge about this topic.)"

        doc = Document(page_content=text, metadata={"source": video_url, "type": "youtube"})
        split_and_store([doc])
        
        return {"status": "Success", "title": title, "content": text}
    except Exception as e: return {"status": "Error", "detail": str(e)}

def process_website(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(url, headers=headers)
        if r.status_code != 200: return {"status": "Error", "detail": "Invalid Link"}

        soup = BeautifulSoup(r.text, 'html.parser')
        for s in soup(["script", "style"]): s.decompose()
        text = soup.get_text(separator="\n").strip()
        title = soup.title.string.strip() if soup.title else "Website"

        doc = Document(page_content=text, metadata={"source": url, "type": "web"})
        split_and_store([doc])
        return {"status": "Success", "title": title, "content": text}
    except Exception as e: return {"status": "Error", "detail": str(e)}

def answer_query(question):
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})
    template = """You are a helpful AI assistant. Answer based on context:\n{context}\nQuestion: {question}"""
    prompt = ChatPromptTemplate.from_template(template)
    chain = ({"context": retriever, "question": RunnablePassthrough()} | prompt | llm | StrOutputParser())
    return chain.invoke(question)

def clear_database():
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        index.delete(delete_all=True)
        return True
    except: return False