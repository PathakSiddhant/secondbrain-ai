import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from rag import process_document  # Humne jo abhi function banaya

app = FastAPI()

# Uploads folder banao agar nahi hai
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "SecondBrain API is Running 🚀"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    User file upload karega -> Hum save karenge -> Phir Pinecone mein daalenge
    """
    try:
        # 1. File ko local disk par save karo temporarily
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. File ko process karo (RAG Magic)
        process_document(file_path)

        # 3. Cleanup (Optional: File delete kar sakte ho baad mein)
        # os.remove(file_path) 

        return {"filename": file.filename, "status": "Successfully added to Brain 🧠"}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))