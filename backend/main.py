from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
# 👇 Import all functions
from rag import process_document, process_youtube, process_website, answer_query, clear_database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LinkRequest(BaseModel):
    url: str
    type: str 

@app.post("/process-link")
async def process_link_endpoint(request: LinkRequest):
    try:
        # Check type loosely to handle 'web' or 'website'
        if request.type == "youtube":
            result = process_youtube(request.url)
        elif request.type in ["web", "website"]:
            result = process_website(request.url)
        else:
            return {"status": "Error", "detail": "Invalid link type"}
            
        return {"status": "Processed Link 🔗", "detail": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process returns a Dict now: {status, content, type}
        result = process_document(file_path)
        
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Check if returned result is a dictionary and has success status
        if isinstance(result, dict) and result.get("status") == "Success":
            return {
                "status": "Processed", 
                "filename": file.filename, 
                "content": result.get("content", ""), 
                "type": result.get("type", "file")
            }
        else:
            # Extract error message
            error_msg = result.get("content") if isinstance(result, dict) else str(result)
            raise HTTPException(status_code=500, detail=f"Failed: {error_msg}")
            
    except Exception as e:
        # Cleanup if error occurs during save
        if os.path.exists(f"temp_{file.filename}"):
             os.remove(f"temp_{file.filename}")
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

@app.post("/chat")
async def chat_endpoint(request: dict):
    query = request.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="Query is missing")
    
    response = answer_query(query)
    return {"answer": response}

@app.delete("/reset")
async def reset_brain():
    success = clear_database()
    if success:
        return {"status": "Brain Wiped Clean 🧠✨"}
    else:
        raise HTTPException(status_code=500, detail="Failed to clear database")