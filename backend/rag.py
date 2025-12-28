import os
import requests # ✅ Fixed: Standard requests library
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

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

print("🔹 Initializing AI Models...")
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
vector_store = PineconeVectorStore(index_name=PINECONE_INDEX_NAME, embedding=embeddings)
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.3)

# --- HELPER: STORE IN PINECONE ---
def split_and_store(docs):
    try:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        if not splits: return "No content to store."
        
        print(f"🚀 Uploading {len(splits)} chunks to Pinecone...")
        vector_store.add_documents(splits)
        return "Success"
    except Exception as e:
        print(f"❌ Pinecone Error: {e}")
        return f"Pinecone Error: {str(e)}"

# --- 1. ROBUST FILE PROCESSOR ---
def process_document(file_path):
    print(f"📄 Processing File: {file_path}")
    try:
        loader = None
        doc_type = "text"
        docs = []

        # A. PDF
        if file_path.lower().endswith(".pdf"):
            loader = PyPDFLoader(file_path)
            doc_type = "pdf"
            docs = loader.load()

        # B. Word (.docx)
        elif file_path.lower().endswith(".docx"):
            loader = Docx2txtLoader(file_path)
            doc_type = "word"
            docs = loader.load()

        # C. Excel (.xlsx) & CSV - Pandas Magic
        elif file_path.lower().endswith(".xlsx") or file_path.lower().endswith(".xls"):
            try:
                df = pd.read_excel(file_path)
                text_data = df.to_string(index=False)
                docs = [Document(page_content=text_data, metadata={"source": file_path, "type": "excel"})]
                doc_type = "excel"
            except Exception as e:
                return {"status": "Error", "content": f"Excel Error: {str(e)}"}

        elif file_path.lower().endswith(".csv"):
            try:
                df = pd.read_csv(file_path)
                text_data = df.to_string(index=False)
                docs = [Document(page_content=text_data, metadata={"source": file_path, "type": "csv"})]
                doc_type = "csv"
            except Exception as e:
                return {"status": "Error", "content": f"CSV Error: {str(e)}"}

        # D. Code/Text Files (Fallback)
        else:
            # Autodetect encoding helps with code files
            loader = TextLoader(file_path, encoding='utf-8', autodetect_encoding=True)
            doc_type = "code"
            docs = loader.load()

        # Store in DB
        if not docs:
            return {"status": "Error", "content": "No text found in file"}
            
        result = split_and_store(docs)
        
        if result == "Success":
            # Extract content for frontend preview
            content_preview = "\n\n".join([d.page_content for d in docs])
            return {"status": "Success", "content": content_preview, "type": doc_type}
        else:
            return {"status": "Error", "content": result, "type": "error"}

    except Exception as e:
        print(f"❌ Processing Error: {e}")
        return {"status": "Error", "content": str(e)}

# --- 2. YOUTUBE PROCESSOR ---
def process_youtube(video_url):
    print(f"🎥 YouTube: {video_url}")
    try:
        video_id = None
        if "youtu.be" in video_url:
            video_id = video_url.split("/")[-1].split("?")[0]
        elif "v=" in video_url:
            video_id = video_url.split("v=")[-1].split("&")[0]
        
        if not video_id: return "Invalid URL"

        transcript_text = ""
        try:
            yt = YouTubeTranscriptApi()
            transcript_list = yt.list_transcripts(video_id)
            # Try English or Hindi
            try:
                transcript = transcript_list.find_transcript(['en', 'hi'])
            except:
                transcript = next(iter(transcript_list))
                
            data = transcript.fetch()
            transcript_text = " ".join([i['text'] for i in data])
        except Exception as e:
            # Fallback
            print(f"⚠️ Transcript fallback: {e}")
            data = YouTubeTranscriptApi.get_transcript(video_id)
            transcript_text = " ".join([i['text'] for i in data])

        doc = Document(page_content=transcript_text, metadata={"source": video_url, "type": "youtube"})
        return split_and_store([doc])
    except Exception as e:
        return f"YouTube Error: {str(e)}"

# --- 3. WEB PROCESSOR ---
def process_website(url):
    print(f"🌐 Website: {url}")
    try:
        headers = { "User-Agent": "Mozilla/5.0" }
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200: return f"Blocked (Status {response.status_code})"

        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove junk
        for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
            script.decompose()

        text_content = soup.get_text(separator="\n")
        lines = [line.strip() for line in text_content.splitlines() if line.strip()]
        clean_text = "\n".join(lines)
        
        if len(clean_text) < 50: return "Website content empty/protected."

        doc = Document(page_content=clean_text, metadata={"source": url, "type": "web"})
        return split_and_store([doc])

    except Exception as e:
        return f"Web Error: {str(e)}"

# --- 4. CLEAR DATABASE ---
def clear_database():
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        index.delete(delete_all=True)
        return True
    except Exception:
        return False

# --- CHAT LOGIC (Strict Formatting - As Requested) ---
def answer_query(question):
    print(f"🤔 Thinking about: {question}")
    
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})

    template = """
    You are an intelligent AI Assistant. Your goal is to provide a structured, beautiful, and easy-to-read response.
    
    CRITICAL FORMATTING RULES (YOU MUST FOLLOW THESE):
    1. **HEADINGS:** Use '###' for section titles. (e.g., ### Key Takeaways)
    2. **LISTS:** Use bullet points ('-') for list items. Do not write long paragraphs.
    3. **HIGHLIGHTS:** Use **bold** for important words or phrases.
    4. **SPACING:** Leave a blank line between every section or bullet point.
    
    RESPONSE STRUCTURE:
    - Start with a clear '### Title' based on the question.
    - Use bullet points for the main content.
    - End with a short '### Conclusion' or Summary.

    Context:
    {context}

    Question: {question}
    
    Answer:
    """
    prompt = ChatPromptTemplate.from_template(template)

    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain.invoke(question)