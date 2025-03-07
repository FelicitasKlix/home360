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
    def get_by_specialty3(specialty_name):
        print(f"\n=== Iniciando búsqueda de profesionales ===")
        print(f"Especialidad buscada: '{specialty_name}'")
        
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
            
        professionals = (
            db.collection("professionals")
            .where("approved", "==", "approved")
            .where("specialty", "array_contains", specialty_name)
            .get()
        )
        
        result_list = []
        
        for professional in professionals:
            prof_data = professional.to_dict()
            professional_email = prof_data.get('email')
            
            quotations = db.collection("quotations").where("professionalEmail", "==", professional_email).where("status", "==", "completed").get()
            services = db.collection("services").where("professionalEmail", "==", professional_email).where("status", "==", "completed").get()
            
            total_points = 0
            total_reviews = 0
            
            for quote in quotations:
                quote_data = quote.to_dict()
                print("QUOTE DATA")
                review_scores = quote_data["review"]
                if review_scores:
                    print(review_scores['points_for_professional'])
                    total_points += review_scores['points_for_professional']
                    total_reviews += 1
            
            for service in services:
                service_data = service.to_dict()
                review_scores = service_data["review"]
                if review_scores:
                    total_points += review_scores['points_for_professional']
                    total_reviews += 1
            
            average_score = total_points / total_reviews if total_reviews > 0 else 0
            
            prof_data['average_score'] = average_score
            
            result_list.append(prof_data)
            
            print(f"Profesional {prof_data.get('first_name')} - Puntaje promedio: {average_score}")
        
        return result_list

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
    def add_device_token(email, token):
        docs = db.collection("professionals").where("email", "==", email).stream()
        
        for doc in docs:
            doc_ref = db.collection("professionals").document(doc.id)
            doc_ref.update({"device_token": token})
            return

        raise ValueError(f"No se encontró un paciente con email {email}")
    
    @staticmethod
    def get_device_token(email):
        docs = db.collection("professionals").where("email", "==", email).stream()
        
        for doc in docs:
            doc_ref = db.collection("professionals").document(doc.id)
            return doc_ref.get().to_dict().get("device_token")

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
    def is_blocked_professional(id):
        return db.collection("deniedProfessionals").document(id).get().exists

    @staticmethod
    def get_email(id):
        return db.collection("professionals").document(id).get().to_dict()["email"]
    
    @staticmethod
    def get_name_and_last_name(id):
        return db.collection("professionals").document(id).get().to_dict()["first_name"], db.collection("professionals").document(id).get().to_dict()["last_name"]

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
