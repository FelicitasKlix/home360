import time
from fastapi import UploadFile, HTTPException, status
from firebase_admin import storage, firestore

from app.models.entities.User import User

db = firestore.client()

class Image:
    def __init__(self, image: list[UploadFile], email: str):
        self.image = image
        self.email = email

    async def save(self):
        response_data = []
        bucket = storage.bucket()
        
        for image_to_upload in self.image:
            id = db.collection("images").document(self.email).collection("uploaded_images").document().id
            
            # Se usa email en la ruta en lugar de `self.user_id`
            blob = bucket.blob(f"images/{self.email}/{id}.{image_to_upload.filename.split('.')[-1]}")
            blob.upload_from_file(image_to_upload.file)
            blob.make_public()

            document_data_object = {
                "id": id,
                "file_name": image_to_upload.filename,
                "uploaded_at": round(time.time()),
                "url": blob.public_url,
            }

            # Guardar en Firestore en la colección del usuario correcto
            db.collection("images").document(self.email).collection("uploaded_images").document(id).set(document_data_object)
            response_data.append(document_data_object)

        return response_data
