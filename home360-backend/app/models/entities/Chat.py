from fastapi import HTTPException, status
from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

class Chat:
    id: str
    message: str
    sender: str
    receiver: str
    quotation: str
    timestamp: str

    def __init__(
        self,
        id: str,
        message: str,
        sender: str,
        receiver: str,
        quotation: str,
    ):
        self.id = id
        self.message = message
        self.sender = sender
        self.receiver = receiver
        self.quotation = quotation
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    @staticmethod
    def get_by_id(id):
        return db.collection("chats").document(id).get().to_dict()
    
    @staticmethod
    def get_by_professional_email(email):
        quotations = (
            db.collection("chats")
            .where("professionalEmail", "==", email)
            .get()
        )
        return [quotation.to_dict() for quotation in quotations]
    
    @staticmethod
    def get_by_user_email(email):
        quotations = (
            db.collection("chats")
            .where("userEmail", "==", email)
            .get()
        )
        return [quotation.to_dict() for quotation in quotations]

    def create(self):
        if db.collection("chats").document(self.id).get().exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The chat already exists",
            )
        
        db.collection("chats").document(self.id).set(
            {
                "id": self.id,
                "message": self.message,
                "sender": self.sender,
                "receiver": self.receiver,
                "quotation": self.quotation,
                "timestamp": self.timestamp
            }
        )
        return self.id