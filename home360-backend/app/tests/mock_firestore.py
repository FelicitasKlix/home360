import time
from datetime import datetime
from config import *
from firebase_admin import firestore, auth

if __name__ == "__main__":
    db = firestore.client()

    specialties = ["albañileria","carpinteria","cerrajeria","educacion","electricidad","gas","herreria","jardineria","limpieza","pintura","pisos","plomeria","service","tapiceria","techos","vidrieria"]

    zones = ['Palermo', 'Recoleta', 'Belgrano', 'Núñez', 'Caballito','Villa Urquiza', 'Villa Devoto', 'Villa del Parque', 'Flores','Almagro', 'Boedo', 'San Telmo', 'La Boca', 'Puerto Madero']

    admin_information = {
        "email": "admin@admin.com",
        "password": "Admin1234",
    }

    for specialty in specialties:
        db.collection("specialties").document().set({"name": specialty})

    for blood_type in zones:
        db.collection("zones").document().set({"name": blood_type})

    admin_uid = auth.create_user(**admin_information).uid
    db.collection("superusers").document(admin_uid).set(admin_information)