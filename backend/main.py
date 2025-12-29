from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from typing import Optional
from rag import (
    process_document, process_youtube, process_website, answer_query, clear_database,
    create_chat_session, save_message, get_user_chats, get_chat_details, 
    delete_chat_session, rename_chat_session # 👈 Added Import
)

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

class ChatRequest(BaseModel):
    query: str
    user_id: str
    chat_id: Optional[str] = None
    source_type: str = "general"
    source_title: str = "New Chat" 
    source_url: Optional[str] = None

# 👇 NEW: Rename Request Model
class RenameRequest(BaseModel):
    new_title: str

@app.post("/process-link")
async def process_link_endpoint(request: LinkRequest):
    try:
        # Logic update to handle return format
        if request.type == "youtube": result = process_youtube(request.url)
        elif request.type in ["web", "website"]: result = process_website(request.url)
        else: return {"status": "Error", "detail": "Invalid link type"}
        
        # Check if result has status key (new logic)
        if isinstance(result, dict) and result.get("status") == "Error":
             raise HTTPException(status_code=500, detail=result.get("detail"))

        return {"status": "Processed Link 🔗", "detail": result} # Result contains 'title'
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"
    try:
        with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
        result = process_document(file_path)
        if isinstance(result, dict) and result.get("status") == "Success":
            return {"status": "Processed", "filename": file.filename, "content": result.get("content", ""), "type": result.get("type", "file")}
        else:
            raise HTTPException(status_code=500, detail=result.get("content"))
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path): os.remove(file_path)

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        current_chat_id = request.chat_id
        if not current_chat_id:
            current_chat_id = create_chat_session(
                request.user_id, request.source_title, request.source_type, request.source_url
            )
        save_message(current_chat_id, "user", request.query)
        ai_response = answer_query(request.query)
        save_message(current_chat_id, "ai", ai_response)
        return {"answer": ai_response, "chat_id": current_chat_id}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{user_id}")
async def get_history(user_id: str):
    return {"chats": get_user_chats(user_id)}

@app.get("/chat/{chat_id}")
async def get_chat(chat_id: str):
    return get_chat_details(chat_id)

@app.delete("/chat/{chat_id}")
async def delete_chat(chat_id: str):
    if delete_chat_session(chat_id): return {"status": "Deleted"}
    raise HTTPException(status_code=500, detail="Failed")

# 🔥 NEW: Patch Endpoint for Rename
@app.patch("/chat/{chat_id}")
async def rename_chat(chat_id: str, request: RenameRequest):
    if rename_chat_session(chat_id, request.new_title):
        return {"status": "Updated", "title": request.new_title}
    raise HTTPException(status_code=500, detail="Rename failed")

@app.delete("/reset")
async def reset_brain():
    clear_database()
    return {"status": "Brain Wiped Clean 🧠✨"}