import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import process_document, answer_query # Humne answer_query import kiya

app = FastAPI()

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Data Model: Batata hai ki request kaisi dikhegi
class QueryRequest(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"message": "SecondBrain API is Running 🚀"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        process_document(file_path)
        return {"filename": file.filename, "status": "Successfully added to Brain 🧠"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- NEW: CHAT ENDPOINT ---
@app.post("/chat")
async def chat_endpoint(request: QueryRequest):
    try:
        # User ka sawal AI ko bhejo
        answer = answer_query(request.query)
        return {"answer": answer}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error generating answer")