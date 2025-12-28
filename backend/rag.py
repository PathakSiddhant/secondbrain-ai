import os
import requests
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from bs4 import BeautifulSoup
# Ab ye import 100% chalega kyunki version 1.2.3 hai
from youtube_transcript_api import YouTubeTranscriptApi 
from pinecone import Pinecone

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
vector_store = PineconeVectorStore(index_name=PINECONE_INDEX_NAME, embedding=embeddings)
llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0.3)

def split_and_store(docs):
    try:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        
        if not splits:
            return "No content found to store."
            
        print(f"🚀 Uploading {len(splits)} chunks to Pinecone...")
        vector_store.add_documents(splits)
        print("🎉 Data stored successfully!")
        return "Success"
    except Exception as e:
        return f"Pinecone Error: {str(e)}"

# --- 1. PDF PROCESSOR ---
def process_document(file_path):
    print(f"📄 Processing PDF: {file_path}")
    try:
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        return split_and_store(docs)
    except Exception as e:
        return f"PDF Error: {str(e)}"

# --- 2. YOUTUBE PROCESSOR (Fix for Object vs Dict) ---
def process_youtube(video_url):
    print(f"🎥 Processing YouTube: {video_url}")
    try:
        # 1. Extract Video ID
        video_id = None
        if "youtu.be" in video_url:
            video_id = video_url.split("/")[-1].split("?")[0]
        elif "v=" in video_url:
            video_id = video_url.split("v=")[-1].split("&")[0]
        
        if not video_id:
            return "Invalid YouTube URL format."

        # 2. Fetch Transcript (Object-based access)
        transcript_text = ""
        try:
            yt_api = YouTubeTranscriptApi()
            transcript_list_obj = yt_api.list(video_id)
            first_transcript = next(iter(transcript_list_obj)) 
            
            print(f"✅ Found transcript: Language={first_transcript.language}")
            
            # Fetch data (Returns list of Objects, not Dicts)
            transcript_data = first_transcript.fetch()
            
            # 👇 YAHAN CHANGE KIYA HAI: item['text'] -> item.text
            transcript_text = " ".join([item.text for item in transcript_data])
            
        except Exception as e:
            # Fallback for Direct Fetch
            try:
                print("⚠️ Listing failed, trying direct fetch...")
                transcript_data = yt_api.fetch(video_id)
                # 👇 YAHAN BHI CHANGE KIYA HAI
                transcript_text = " ".join([item.text for item in transcript_data])
            except Exception as final_error:
                return f"No transcript found. Error: {str(e)} | Direct Fetch: {str(final_error)}"
        
        if not transcript_text:
            return "Transcript is empty."

        # 3. Store in Pinecone
        doc = Document(page_content=transcript_text, metadata={"source": video_url, "type": "youtube"})
        return split_and_store([doc])
        
    except Exception as e:
        print(f"❌ YouTube Error: {e}")
        return f"YouTube Error: {str(e)}"
# --- 3. WEBSITE PROCESSOR ---
def process_website(url):
    print(f"🌐 Processing Website: {url}")
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            return f"Website blocked us (Status {response.status_code})"

        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Cleanup
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()

        text_content = soup.get_text(separator="\n")
        lines = [line.strip() for line in text_content.splitlines() if line.strip()]
        clean_text = "\n".join(lines)
        
        if len(clean_text) < 50:
            return "Website content is too short or protected."

        doc = Document(page_content=clean_text, metadata={"source": url, "type": "web"})
        return split_and_store([doc])

    except Exception as e:
        print(f"❌ Web Scraping Error: {e}")
        return f"Web Error: {str(e)}"

# --- 4. CLEAR DATABASE (Robust Fix) ---
def clear_database():
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        
        # Try to delete, ignore if namespace not found
        try:
            index.delete(delete_all=True)
            print("🗑️ Pinecone Index Cleared!")
        except Exception as e:
            if "Not Found" in str(e) or "404" in str(e):
                print("⚠️ Index already empty, nothing to delete.")
            else:
                raise e # Real error hai toh batao
                
        return True
    except Exception as e:
        print(f"❌ Error clearing DB: {e}")
        return False

# --- CHAT LOGIC (Strict Markdown Formatting) ---
def answer_query(question):
    print(f"🤔 Thinking about: {question}")
    
    # Context window badha di hai for better details
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