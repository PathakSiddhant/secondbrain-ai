import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # 👈 YE HAI NEW IMPORT
from rag import process_document

app = FastAPI()

# --- CORS SETTINGS (YE IMPORTANT HAI) ---
# Ye browser ko batata hai ki "Haan, localhost:3000 se request aane do"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Filhal hum sabko allow kar rahe hain (Development ke liye)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads folder setup
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "SecondBrain API is Running 🚀"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # 1. File save karo
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Process karo
        process_document(file_path)

        return {"filename": file.filename, "status": "Successfully added to Brain 🧠"}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))