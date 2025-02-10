from fastapi import HTTPException, status
from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

class Quotation:
    professionalEmail: str
    userEmail: str
    category: str
    description: str
    direccion: str
    id: str
    status: str
    created_at: str

    def __init__(
        self,
        professionalEmail: str,
        userEmail: str,
        category: str,
        description: str,
        direccion: str,
        id: str,
        status: str = "pending",
    ):
        self.professionalEmail = professionalEmail
        self.userEmail = userEmail
        self.category = category
        self.description = description
        self.direccion = direccion
        self.id = id
        self.status = status
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    @staticmethod
    def get_by_id(id):
        return db.collection("quotations").document(id).get().to_dict()
    
    @staticmethod
    def get_by_professional_email(email):
        quotations = (
            db.collection("quotations")
            .where("professionalEmail", "==", email)
            .get()
        )
        return [quotation.to_dict() for quotation in quotations]
    
    @staticmethod
    def get_by_user_email(email):
        quotations = (
            db.collection("quotations")
            .where("userEmail", "==", email)
            .get()
        )
        return [quotation.to_dict() for quotation in quotations]
    
    @staticmethod
    def update_status(id, new_status):
        if new_status not in ["pending", "accepted", "rejected", "completed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status value",
            )
        db.collection("quotations").document(id).update({"status": new_status})
        return True

    def create(self):
        if db.collection("quotations").document(self.id).get().exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The quotation already exists",
            )
        
        db.collection("quotations").document(self.id).set(
            {
                "id": self.id,
                "professionalEmail": self.professionalEmail,
                "userEmail": self.userEmail,
                "category": self.category,
                "description": self.description,
                "direccion": self.direccion,
                "status": self.status,
                "created_at": self.created_at
            }
        )
        return self.id