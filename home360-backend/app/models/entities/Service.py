from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore

db = firestore.client()


class Service:
    description: str
    location: list
    category: list
    #user_id: str

    def __init__(
        self,
        description: str,
        location: list,
        category: list,
        #user_id: str,
    ):
        self.description = description
        self.location = location
        self.category = category
        #self.user_id = user_id

    @staticmethod
    def get_by_id(id):
        return db.collection("services").document(id).get().to_dict()


    def create(self):
        id = db.collection("services").document().id
        db.collection("services").document(id).set(
            {
                "id": id,
                "description": self.description,
                "location": self.location,
                "category": self.category,
                #"user_id": self.user_id
            }
        )
