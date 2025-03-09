import json
import os
from dotenv import load_dotenv
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from firebase_admin import firestore
from app.models.entities.Message import Message
from app.models.entities.EmergencyMessage import EmergencyMessage


db = firestore.client()
load_dotenv()

router = APIRouter(
    prefix="/chat", 
    tags=["Chat"], 
    responses={404: {"description": "Not found"}}
)

with open("credentials/client.json") as fp:
    firebase_client_config = json.loads(fp.read())

SECRET_SHARED_TOKEN = os.environ.get("SECRET_SHARED_TOKEN")

@router.post("/send")
async def send_message(msg: Message):
    try:
        message_data = {
            "message": msg.message,
            "sender": msg.sender,
            "receiver": msg.receiver,
            "quotation_id": msg.quotation_id,
            "timestamp": datetime.now().isoformat()
        }
        db.collection("messages").add(message_data)
        return {"success": True, "message": "Mensaje enviado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/{user1}/{user2}")
async def get_chat_messages(user1: str, user2: str, quotation_id: str):
    try:
        chat_ref = db.collection("messages")
        query = chat_ref.where("sender", "in", [user1, user2]).where("receiver", "in", [user1, user2]).where("quotation_id", "==", quotation_id)
        messages = query.stream()
        
        chat_history = [{"id": msg.id, **msg.to_dict()} for msg in messages]
        chat_history.sort(key=lambda x: x["timestamp"])

        return {"success": True, "messages": chat_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/emergency/send")
async def send_emergency_message(msg: EmergencyMessage):
    try:
        message_data = {
            "message": msg.message,
            "sender": msg.sender,
            "receiver": msg.receiver,
            "emergency_service_id": msg.emergency_service_id,
            "timestamp": datetime.now().isoformat()
        }
        db.collection("emergency_messages").add(message_data)
        return {"success": True, "message": "Mensaje enviado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/emergency/{user1}/{user2}")
async def get_emergency_chat_messages(user1: str, user2: str, emergency_service_id: str):
    try:
        chat_ref = db.collection("emergency_messages")
        query = (
            chat_ref.where("sender", "in", [user1, user2])
                    .where("receiver", "in", [user1, user2])
                    .where("emergency_service_id", "==", emergency_service_id)
        )
        messages = query.stream()
        
        chat_history = [{"id": msg.id, **msg.to_dict()} for msg in messages]
        chat_history.sort(key=lambda x: x["timestamp"])

        return {"success": True, "messages": chat_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
