from fastapi import APIRouter, status, FastAPI, File, UploadFile, HTTPException, Depends, Form, Query
from fastapi.responses import JSONResponse
import os
import unicodedata
from firebase_admin import firestore, storage
from dotenv import load_dotenv
from typing import Union
import re

from app.models.entities.Auth import Auth
from app.models.entities.Image import Image
from app.models.entities.Professional import Professional
from app.models.responses.ProfessionalResponses import (
    GetProfessionalsError,
    GetProfessionalsResponse,
    GetProfessionalReviews,
    SuccessfulImageResponse,
    ErrorImageResponse
)

db = firestore.client()

load_dotenv()

router = APIRouter(
    prefix="/professionals",
    tags=["Professionals"],
    responses={404: {"description": "Not found"}},
)

SECRET_SHARED_TOKEN = os.environ.get("SECRET_SHARED_TOKEN")

@router.get(
    "/specialty/{specialty_name}",
    status_code=status.HTTP_200_OK,
    response_model=GetProfessionalsResponse,
    responses={
        401: {"model": GetProfessionalsError},
        500: {"model": GetProfessionalsError},
    },
)
def get_professionals_by_specialty(specialty_name: str):
    """
    Get all professionals by specialty.

    This will allow authenticated users to retrieve all professionals that are specialized in chosen specialty.

    This path operation will:

    * Return all the professionals in the system that match the given specialty.
    * Throw an error if professional retrieving fails.
    """
    try:
        specialty_normalized = unicodedata.normalize('NFKD', specialty_name).encode('utf-8', 'ignore').decode('utf-8').lower()
        professionals = Professional.get_by_specialty3(specialty_normalized)
        
        professionals_sorted = sorted(professionals, key=lambda prof: prof.get('average_score', 0), reverse=True)
        return {"professionals": professionals_sorted}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
    

@router.get(
    "/reviews/{email}",
    status_code=status.HTTP_200_OK,
    response_model=GetProfessionalReviews,
    responses={
        401: {"model": GetProfessionalsError},
        500: {"model": GetProfessionalsError},
    },
)
def get_professional_reviews(email: str):
    """
    Get all reviews for a professional.

    This will allow authenticated users to retrieve all reviews for a chosen professional.

    This path operation will:

    * Return all the reviews for the professional.
    * Throw an error if retrieving fails.
    """
    try:
        reviews = Professional.get_professionals_reviews(email)
        return {"reviews": reviews}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.post(
    "/upload-image",
    status_code=status.HTTP_201_CREATED,
    response_model=list[Union[SuccessfulImageResponse, None]],
    responses={
        401: {"model": ErrorImageResponse},
        500: {"model": ErrorImageResponse},
    },
)
async def upload_image(
    image: list[UploadFile] = File(...), 
    email: str = Form(...)
):
    image_instance = Image(image=image, email=email)
    try:
        saved_image = await image_instance.save()
        return saved_image
    except HTTPException as http_exception:
        return http_exception
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

@router.get(
    "/get-images/{email}",
    response_model=list[str],
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": ErrorImageResponse},
        500: {"model": ErrorImageResponse},
    },
)
async def get_images(email: str):
    try:
        images_ref = db.collection("images").document(email).collection("uploaded_images")
        images = images_ref.stream()

        url_list = [image.to_dict().get("url") for image in images if "url" in image.to_dict()]


        if not url_list:
            raise HTTPException(status_code=404, detail="No images found")

        return url_list

    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": str(e)},
        )


@router.get(
    "/get-images2/{email}",
    response_model=list[dict],
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": ErrorImageResponse},
        500: {"model": ErrorImageResponse},
    },
)
async def get_images2(email: str):
    try:
        images_ref = db.collection("images").document(email).collection("uploaded_images")
        images = images_ref.stream()

        image_list = []
        for image in images:
            image_data = image.to_dict()
            image_list.append(image_data)

        if not image_list:
            raise HTTPException(status_code=404, detail="No images found")

        return image_list

    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": str(e)},
        )

@router.delete("/delete-image", status_code=200)
async def delete_image(email: str = Query(...), image_url: str = Query(...)):
    try:
        print(f"Intentando eliminar la imagen con URL: {image_url} del usuario: {email}")
        image_id = re.search(r'/([^/]+)\.jpg$', image_url).group(1)
        print(image_id)
        image_ref = db.collection("images").document(email).collection("uploaded_images").document(image_id)
        print(image_ref)
        image_ref.delete()
        return {"detail": "Image deleted successfully"}

    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        print(f"Error en el servidor: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})
