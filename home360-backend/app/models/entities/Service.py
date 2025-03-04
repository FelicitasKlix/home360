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
    #user_id: str

    def __init__(
        self,
        userEmail: str,
        description: str,
        location: list,
        category: list,
        status: str = "pending",
        #user_id: str,
    ):
        self.userEmail = userEmail
        self.description = description
        self.location = location
        self.category = category
        self.status = status
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        #self.user_id = user_id

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
        
        # Agregar el campo "type": "emergency" a cada servicio
        completed_services = []
        for service in services:
            service_data = service.to_dict()
            service_data['type'] = 'emergency'  # Agregamos el campo type
            completed_services.append(service_data)
        
        return completed_services


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
                #"user_id": self.user_id
            }
        )
