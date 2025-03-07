from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore

db = firestore.client()


class Service:
    userEmail: str
    description: str
    location: list
    category: list
    created_at: str
    status: str

    def __init__(
        self,
        userEmail: str,
        description: str,
        location: list,
        category: list,
        status: str = "pending",
    ):
        self.userEmail = userEmail
        self.description = description
        self.location = location
        self.category = category
        self.status = status
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    @staticmethod
    def get_by_id(id):
        return db.collection("services").document(id).get().to_dict()

    @staticmethod
    def get_pending_services():
        services = (
            db.collection("services")
            .where("status", "==", "pending")
            .get()
        )
        return [service.to_dict() for service in services]
    
    @staticmethod
    def get_completed_services():
        services = (
            db.collection("services")
            .where("status", "==", "completed")
            .get()
        )
        
        completed_services = []
        for service in services:
            service_data = service.to_dict()
            service_data['type'] = 'emergency'
            completed_services.append(service_data)
        
        return completed_services

    @staticmethod
    def get_user_from_service(service_id):
        service = db.collection("services").document(service_id).get()
        return service.to_dict().get("userEmail")

    def create(self):
        id = db.collection("services").document().id
        db.collection("services").document(id).set(
            {
                "id": id,
                "userEmail": self.userEmail,
                "description": self.description,
                "location": self.location,
                "category": self.category,
                "status": self.status,
                "created_at": self.created_at
            }
        )
