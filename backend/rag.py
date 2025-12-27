import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

# 1. Setup Embeddings
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")

# 2. Setup Vector DB
vector_store = PineconeVectorStore(index_name=PINECONE_INDEX_NAME, embedding=embeddings)

# 3. Setup LLM (Gemini)
llm = ChatGoogleGenerativeAI(
    model="gemini-flash-latest",
    temperature=0.3, # 0.3 matlab thoda sa creative, par focused
)

def process_document(file_path):
    """PDF Upload Logic"""
    print(f"📄 Processing file: {file_path}")
    loader = PyPDFLoader(file_path)
    raw_docs = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    documents = text_splitter.split_documents(raw_docs)
    
    print("🚀 Uploading to Pinecone...")
    vector_store.add_documents(documents)
    print("🎉 Document stored.")
    return True

def answer_query(question):
    """
    RAG Logic: Sawal ka jawab document se dhoond kar do.
    """
    print(f"🤔 Thinking about: {question}")
    
    # 1. Retriever: Pinecone se top 3 matching pages lao
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    # 2. Prompt: AI ko instruct karo
    template = """
    You are a helpful assistant. Answer the question based ONLY on the following context:
    {context}

    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    # 3. Chain: Steps ko jodo
    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    # 4. Run logic
    result = chain.invoke(question)
    return result