import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

# Setup Embeddings (Model 004 use kar rahe hain jo working hai)
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")

# Setup Vector DB
vector_store = PineconeVectorStore(index_name=PINECONE_INDEX_NAME, embedding=embeddings)

# Setup LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

def process_document(file_path):
    """
    Ye function PDF ko padh kar Pinecone mein save karega.
    """
    print(f"📄 Processing file: {file_path}")
    
    # 1. Load PDF
    loader = PyPDFLoader(file_path)
    raw_docs = loader.load()
    print(f"✅ PDF Loaded. Total Pages: {len(raw_docs)}")

    # 2. Split Text (Chunks banana)
    # 1000 characters ka ek chunk, aur 200 ka overlap taaki context na tute
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    documents = text_splitter.split_documents(raw_docs)
    print(f"🧩 Split into {len(documents)} text chunks.")

    # 3. Save to Pinecone
    print("🚀 Uploading to Pinecone... (thoda time lagega)")
    vector_store.add_documents(documents)
    print("🎉 Success! Document stored in Memory.")
    
    return True