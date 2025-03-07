from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
import os
import unicodedata

from app.models.entities.Auth import Auth
from app.models.entities.Professional import Professional
from app.models.responses.ProfessionalResponses import (
    GetProfessionalsError,
    GetProfessionalsResponse,
)

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