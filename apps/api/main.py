from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime
from typing import List, Optional

# Load environment variables
load_dotenv("../../.env")

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY_FREE"))

app = FastAPI(
    title="KKI API",
    description="KI-Assistent API mit FastAPI und Gemini",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In Produktion spezifischer setzen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    content: str
    sender: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime

# In-memory storage (später durch MySQL ersetzen)
messages_storage: List[ChatMessage] = []

@app.get("/")
def root():
    return {"message": "KKI API ist online!", "status": "healthy"}

@app.get("/health")
def health_check():
    """Health check endpoint für Deployment-Verifikation"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint mit Gemini AI"""
    try:
        # User message speichern
        user_message = ChatMessage(
            content=request.message,
            sender="user",
            timestamp=datetime.now()
        )
        messages_storage.append(user_message)
        
        # Gemini AI anfragen
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(request.message)
        
        if not response.text:
            raise HTTPException(status_code=500, detail="Keine Antwort von der KI erhalten")
        
        # AI response speichern
        ai_message = ChatMessage(
            content=response.text,
            sender="ai",
            timestamp=datetime.now()
        )
        messages_storage.append(ai_message)
        
        return ChatResponse(
            response=response.text,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler bei der KI-Anfrage: {str(e)}")

@app.get("/api/messages")
def get_messages():
    """Alle Chat-Nachrichten abrufen"""
    return {"messages": messages_storage}

@app.delete("/api/messages")
def clear_messages():
    """Alle Chat-Nachrichten löschen"""
    global messages_storage
    messages_storage = []
    return {"message": "Alle Nachrichten gelöscht"}

# Für Netcup Passenger WSGI
application = app
