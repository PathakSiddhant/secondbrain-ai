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
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from pinecone import Pinecone
from supabase import create_client, Client
from langchain_core.messages import AIMessage, HumanMessage
from langchain_community.document_loaders import PyMuPDFLoader


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
        # Sanitize filename
        safe_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', file_name)
        with open(file_path, "rb") as f:
            supabase.storage.from_("documents").upload(safe_name, f, {"content-type": "auto", "upsert": "true"})
        
        # Construct Public URL
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
                "documents": len([c for c in chats if c['source_type'] in ['pdf', 'word', 'excel', 'file', 'csv', 'code']]),
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
        # 1. Upload to storage
        public_url = upload_file_to_storage(file_path, original_filename)
        
        # 2. Extract content
        loader, doc_type, docs = None, "file", []
        
        if file_path.endswith(".pdf"): 
            loader = PyMuPDFLoader(file_path); doc_type = "pdf"
        elif file_path.endswith(".docx"): 
            loader = Docx2txtLoader(file_path); doc_type = "word"
        elif file_path.endswith((".xlsx", ".xls")):
            doc_type = "excel"
            try:
                xls = pd.ExcelFile(file_path, engine='openpyxl')
                full_text = ""
                for sheet in xls.sheet_names:
                    df = pd.read_excel(file_path, sheet_name=sheet, engine='openpyxl')
                    full_text += f"\n\n=== Sheet: {sheet} ===\n" + df.to_string(index=False)
                docs = [Document(page_content=full_text, metadata={"type": "excel", "filename": original_filename})]
            except Exception as e:
                print(f"Excel error: {e}")
                return {"status": "Error", "content": "Failed to read Excel file"}
        elif file_path.endswith(".csv"):
            doc_type = "csv"
            try:
                df = pd.read_csv(file_path)
                content = "CSV Data:\n\n" + df.to_string(index=False)
                docs = [Document(page_content=content, metadata={"type": "csv", "filename": original_filename})]
            except Exception as e: return {"status": "Error", "content": "Failed to read CSV file"}
        elif file_path.endswith((".txt", ".md", ".py", ".js", ".json", ".html", ".css")): 
            loader = TextLoader(file_path, encoding='utf-8')
            doc_type = "code" if file_path.endswith((".py", ".js", ".html", ".css")) else "text"
        
        if loader: 
            try: docs = loader.load()
            except Exception as e: return {"status": "Error", "content": f"Failed to load file: {str(e)}"}
        
        if not docs: return {"status": "Error", "content": "File is empty or unreadable."}
        
        # Store in vector database
        split_and_store(docs)
        
        content_preview = "\n\n".join([d.page_content[:4000] for d in docs]) 
        
        return {
            "status": "Success", 
            "content": content_preview, 
            "type": doc_type, 
            "url": public_url 
        }
    except Exception as e: return {"status": "Error", "content": str(e)}

def process_youtube(video_url):
    """NoteGPT Style Processing: Tries everything to get content."""
    try:
        regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
        match = re.search(regex, video_url)
        if not match: return {"status": "Error", "detail": "Invalid YouTube URL"}
        vid = match.group(1)
        
        # Fetch Metadata
        title = "YouTube Video"
        description = ""
        try:
            r = requests.get(f"https://www.youtube.com/watch?v={vid}", timeout=10)
            soup = BeautifulSoup(r.text, 'html.parser')
            if soup.title: title = soup.title.string.replace(" - YouTube", "").strip()
            desc_tag = soup.find('meta', property='og:description')
            if desc_tag: description = desc_tag.get('content', '')
        except: pass

        text = description
        transcript_status = "Description only"
        
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(vid)
            
            # Try Manual -> Auto -> Translate
            transcript = None
            try: transcript = transcript_list.find_manually_created_transcript(['en', 'en-US', 'hi', 'hi-IN'])
            except: 
                try: transcript = transcript_list.find_generated_transcript(['en', 'en-US', 'hi'])
                except:
                    # Fallback: Translate whatever exists to English
                    try: transcript = transcript_list.find_transcript(['en']).translate('en')
                    except: pass # Use whatever is first found below

            if not transcript:
                # Grab the first available and force translate if needed
                for t in transcript_list:
                    transcript = t
                    if t.language_code not in ['en', 'hi']:
                        transcript = t.translate('en')
                    break

            if transcript:
                transcript_data = transcript.fetch()
                timestamped_text = ""
                for entry in transcript_data:
                    timestamp = entry.get('start', 0)
                    minutes = int(timestamp // 60)
                    seconds = int(timestamp % 60)
                    timestamped_text += f"[{minutes:02d}:{seconds:02d}] {entry['text']} "
                text = timestamped_text
                transcript_status = "Transcript Loaded"
                
        except Exception as e:
            print(f"⚠️ Transcript fallback: {e}")

        # If content is still thin, use LLM to hallucinate (smartly) a summary based on metadata
        if len(text) < 50:
            try:
                summary = llm.invoke(f"Generate a detailed summary of a video titled '{title}' with description '{description}'. Assume it covers the topic in depth.").content
                text += f"\n\n[AI Summary]:\n{summary}"
                transcript_status = "AI Summary Generated"
            except: pass

        doc = Document(page_content=text, metadata={"source": video_url, "type": "youtube", "title": title})
        split_and_store([doc])
        
        return {"status": "Success", "title": title, "content": text[:4000], "transcript_status": transcript_status}
    except Exception as e: return {"status": "Error", "detail": str(e)}

def process_website(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        r = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        for element in soup(["script", "style", "nav", "footer"]): element.decompose()
        text = soup.get_text(separator="\n", strip=True)
        title = soup.title.string.strip() if soup.title else "Website"

        if len(text) < 100: return {"status": "Error", "detail": "Content too short"}

        doc = Document(page_content=text, metadata={"source": url, "type": "web", "title": title})
        split_and_store([doc])
        return {"status": "Success", "title": title, "content": text}
    except Exception as e: return {"status": "Error", "detail": str(e)}

def answer_query(question, chat_id=None):
    try:
        # 1. Fetch Chat History from Supabase if chat_id exists
        chat_history = []
        if chat_id:
            previous_msgs = supabase.table("messages").select("*").eq("chat_id", chat_id).order("created_at", desc=True).limit(10).execute()
            # Reverse because we fetch mostly recent first, but LLM needs chronological order
            for msg in reversed(previous_msgs.data):
                if msg['role'] == 'user':
                    chat_history.append(HumanMessage(content=msg['content']))
                else:
                    chat_history.append(AIMessage(content=msg['content']))

        # 2. Setup Contextual Prompt
        retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        
        # Ye prompt history ko include karega
        template = """You are SecondBrain, a smart personal knowledge assistant.
        
        Chat History:
        {chat_history}
        
        Context from documents:
        {context}
        
        User Question: {question}
        
        Answer based strictly on the context provided. If the answer is not in the context, say you don't know. 
        Cite the source document names if possible."""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        # 3. Chain Execution
        chain = (
            {
                "context": retriever, 
                "question": RunnablePassthrough(),
                "chat_history": lambda x: chat_history # Inject history here
            } 
            | prompt 
            | llm 
            | StrOutputParser()
        )
        
        return chain.invoke(question)
    except Exception as e:
        print(f"Error in answer_query: {e}")
        return "I encountered an error answering that."

def clear_database():
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        index.delete(delete_all=True)
        return True
    except: return False