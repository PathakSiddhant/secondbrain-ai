import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# Import new functions
from rag import process_document, process_youtube, process_website, answer_query, clear_database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Request Models
class QueryRequest(BaseModel):
    query: str

class LinkRequest(BaseModel):
    url: str
    type: str # 'youtube' or 'website'

@app.get("/")
def read_root():
    return {"message": "SecondBrain API is Running 🚀"}

# 1. PDF UPLOAD
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        process_document(file_path)
        return {"filename": file.filename, "status": "Processed PDF 📄"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ... baaki sab same rahega ...

# 2. LINK PROCESSING (Updated)
@app.post("/process-link")
async def process_link(request: LinkRequest):
    try:
        result = "Unknown Error"
        if request.type == "youtube":
            result = process_youtube(request.url)
        elif request.type == "website":
            result = process_website(request.url)
        else:
            raise HTTPException(status_code=400, detail="Invalid link type")

        # Agar "Success" return hua tabhi 200 OK bhejo
        if result == "Success":
            return {"url": request.url, "status": "Processed Link 🔗"}
        else:
            # Warna actual error dikhao
            raise HTTPException(status_code=500, detail=result)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ... baaki chat endpoint same rahega ...

# 3. CHAT
@app.post("/chat")
async def chat_endpoint(request: QueryRequest):
    try:
        answer = answer_query(request.query)
        return {"answer": answer}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error generating answer")
    
# 👇 NAYA ENDPOINT ADD KARO
@app.delete("/reset")
async def reset_brain():
    success = clear_database()
    if success:
        return {"status": "Brain Wiped Clean 🧠✨"}
    else:
        raise HTTPException(status_code=500, detail="Failed to clear database")