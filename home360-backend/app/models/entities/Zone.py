from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore

db = firestore.client()


class Zone:
    id: str
    name: str

    def __init__(
        self,
        id: str,
        name: str,
    ):
        self.name = name.lower()
        self.id = id

    @staticmethod
    def get_all():
        zones_doc = db.collection("zones").order_by("name").get()
        return [zone_doc.to_dict()["name"] for zone_doc in zones_doc]

    @staticmethod
    def exists_with_name(name):
        return (
            len(db.collection("zones").where("name", "==", name.lower()).get())
            > 0
        )

    @staticmethod
    def add_zone(name):
        if Zone.exists_with_name(name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Zone already exists",
            )
        db.collection("zones").document().set({"name": name.lower()})

    @staticmethod
    def delete_zone(name):
        query = db.collection("zones").where("name", "==", name.lower())

        docs = query.stream()

        for doc in docs:
            doc.reference.delete()
