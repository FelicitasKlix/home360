from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore
import unicodedata

db = firestore.client()


class Professional:
    role: str
    name: str
    #last_name: str
    phone: str
    tuition: str
    #specialty: str
    specialty: list
    email: str
    id: str
    birth_date: str
    zones: list
    approved: str

    def __init__(
        self,
        role: str,
        name: str,
        #last_name: str,
        phone: str,
        tuition: str,
        specialty: list,
        email: str,
        id: str,
        birth_date: str,
        zones: list,
        approved: str = "pending",
    ):
        self.role = role
        self.name = name
        #self.last_name = last_name
        self.phone = phone
        self.tuition = tuition
        #self.specialty = specialty.lower()
        self.specialty = specialty
        self.email = email
        self.id = id
        self.birth_date = birth_date
        self.zones = zones
        self.approved = approved

    @staticmethod
    def get_by_id(id):
        return db.collection("professionals").document(id).get().to_dict()

    @staticmethod
    def get_blocked_by_id(id):
        return db.collection("deniedProfessionals").document(id).get().to_dict()
    
    @staticmethod
    def get_by_specialty2(specialty_name):
        print(f"\n=== Iniciando búsqueda de profesionales ===")
        print(f"Especialidad buscada: '{specialty_name}'")
        
        # Primero, obtengamos todos los profesionales para ver qué hay en la base
        all_professionals = (
            db.collection("professionals")
            .where("approved", "==", "approved")
            .get()
        )
        
        print("\nProfesionales en la base:")
        for prof in all_professionals:
            prof_dict = prof.to_dict()
            print(f"""
            Nombre: {prof_dict.get('first_name')}
            ID: {prof_dict.get('id')}
            Especialidad: {prof_dict.get('specialty')}
            Tipo de especialidad: {type(prof_dict.get('specialty'))}
            """)
        #specialty_normalized = unicodedata.normalize('NFKD', specialty_name).encode('ASCII', 'ignore').decode('utf-8').lower()
        # Ahora hacemos la búsqueda específica
        professionals = (
            db.collection("professionals")
            .where("approved", "==", "approved")
            .where("specialty", "array_contains", specialty_name)
            .get()
        )
        
        result_list = [professional.to_dict() for professional in professionals]
        
        print(f"\nResultados encontrados: {len(result_list)}")
        print("Profesionales que coinciden:")
        for prof in result_list:
            print(f"- {prof.get('first_name')}: {prof.get('specialty')}")
        
        return result_list

    @staticmethod
    def get_by_specialty(specialty_name):
        professionals = (
            db.collection("professionals")
            #.where("specialty", "==", specialty_name)
            .where("specialties", "array_contains", specialty_name)
            .where("approved", "==", "approved")
            .get()
        )
        professionals_list = []
        for professional in professionals:
            prof_dict = professional.to_dict()
            professionals_list.append(prof_dict)
        
        print("Profesionales encontrados:", professionals_list)
        return professionals_list
        #return [professional.to_dict() for professional in professionals]

    
    @staticmethod
    def schedule_appointment(id, date):
        db.collection("professionals").document(id).update({f"appointments.{date}": True})

    @staticmethod
    def get_pending_professionals():
        professionals = (
            db.collection("professionals").where("approved", "==", "pending").get()
        )
        return [professional.to_dict() for professional in professionals]

    @staticmethod
    def get_professionals_working():
        professionals = (
            db.collection("professionals").where("approved", "==", "approved").get()
        )
        return [professional.to_dict() for professional in professionals]
    
    @staticmethod
    def get_professionals_by_email(email):
        professionals = (
            db.collection("professionals").where("email", "==", email).get()
        )
        return [professional.to_dict() for professional in professionals][0]

    @staticmethod
    def get_professionals_denied():
        professionals = db.collection("deniedProfessionals").get()
        return [professional.to_dict() for professional in professionals]

    @staticmethod
    def is_professional(email):
        docs = db.collection("professionals").where("email", "==", email).get()
        return len(docs) > 0
    
    @staticmethod
    def get_by_email(email):
        return db.collection("professionals").where("email", "==", email).get()

    @staticmethod
    def is_blocked_physician(id):
        return db.collection("deniedPhysicians").document(id).get().exists

    @staticmethod
    def approve_appointment(id):
        db.collection("appointments").document(id).update({"status": "approved"})

    @staticmethod
    def deny_appointment(id):
        db.collection("appointments").document(id).update({"status": "denied"})

    @staticmethod
    def get_email(id):
        return db.collection("physicians").document(id).get().to_dict()["email"]
    
    @staticmethod
    def get_name_and_last_name(id):
        return db.collection("physicians").document(id).get().to_dict()["first_name"], db.collection("physicians").document(id).get().to_dict()["last_name"]

    def create(self):
        if db.collection("professionals").document(self.id).get().exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user already exists",
            )
        db.collection("professionals").document(self.id).set(
            {
                "id": self.id,
                "first_name": self.name,
                #"last_name": self.last_name,
                "phone": self.phone,
                "tuition": self.tuition,
                "specialty": self.specialty,
                "email": self.email,
                "birth_date": self.birth_date,
                "zones": self.zones,
                "approved": self.approved,
            }
        )
        return self.id
