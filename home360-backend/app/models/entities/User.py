from fastapi import status, HTTPException

from firebase_admin import firestore

db = firestore.client()


class User:
    role: str
    name: str
    #last_name: str
    phone: str
    email: str
    id: str

    def __init__(
        self,
        role: str,
        name: str,
        #last_name: str,
        phone: str,
        email: str,
        id: str,
    ):
        self.role = role
        self.name = name
        #self.last_name = last_name
        self.phone = phone
        self.email = email
        self.id = id

    @staticmethod
    def get_by_id(id):
        return db.collection("users").document(id).get().to_dict()

    @staticmethod
    def is_user(email):
        docs = db.collection("users").where("email", "==", email).get()
        return len(docs) > 0
    
    @staticmethod
    def get_first_and_last_name(id):
        return db.collection("users").document(id).get().to_dict()["first_name"], db.collection("users").document(id).get().to_dict()["last_name"]
    
    @staticmethod
    def get_email(id):
        return db.collection("users").document(id).get().to_dict()["email"]
    
    @staticmethod
    def get_by_email(email):
        return db.collection("users").where("email", "==", email).get()
    
    @staticmethod
    def get_users_by_email(email):
        professionals = (
            db.collection("users").where("email", "==", email).get()
        )
        return [professional.to_dict() for professional in professionals][0]
    
    @staticmethod
    def add_device_token(email, token):
        docs = db.collection("users").where("email", "==", email).stream()
        
        for doc in docs:
            doc_ref = db.collection("users").document(doc.id)
            doc_ref.update({"device_token": token})
            return

        raise ValueError(f"No se encontró un paciente con email {email}")

    @staticmethod
    def get_device_token(email):
        docs = db.collection("users").where("email", "==", email).stream()
        
        for doc in docs:
            doc_ref = db.collection("users").document(doc.id)
            return doc_ref.get().to_dict().get("device_token")
        
    @staticmethod
    def fetch_rewards_for_user(email):
        docs = db.collection("patients").where("email", "==", email).get()

    def create(self):
        if db.collection("users").document(self.id).get().exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user already exists",
            )
        db.collection("users").document(self.id).set(
            {
                "id": self.id,
                "first_name": self.name,
                "phone": self.phone,
                #"last_name": self.last_name,
                "email": self.email,
            }
        )
