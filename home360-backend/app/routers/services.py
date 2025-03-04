import requests
import json
import os
from dotenv import load_dotenv
from typing import Union, Annotated, List

from fastapi import APIRouter, status, Depends, Body, HTTPException
from fastapi.responses import JSONResponse

from app.models.entities.Service import Service

from firebase_admin import firestore, auth

from app.models.responses.ServiceResponses import (
    SuccessfulRequestResponse,
    RequestErrorResponse,
    EmergencyServiceResponse,
    ActiveServiceResponse
)

from app.models.requests.ServiceRequests import (
    EmergencyServiceRequest,
    AcceptServiceRequest
)

db = firestore.client()

load_dotenv()

router = APIRouter(
    prefix="/services", tags=["Services"], responses={404: {"description": "Not found"}}
)

with open("credentials/client.json") as fp:
    firebase_client_config = json.loads(fp.read())

SECRET_SHARED_TOKEN = os.environ.get("SECRET_SHARED_TOKEN")

@router.post(
    "/emergency",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulRequestResponse,
    responses={
        400: {"model": RequestErrorResponse},
        403: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def request_emergency_service(
    emergency_service_creation_request: EmergencyServiceRequest,
):
    """
    Request an emergency service.

    This will allow authenticated users to request an emergency service.

    This path operation will:

    * Request an emergency service.
    * Raise an error if something fails.
    """
    emergency_service = Service(
        **{**emergency_service_creation_request.model_dump()}
    )
    try:
        print(emergency_service)
        emergency_service.create()
        #Study.add_study(study_name)
        #updated_studies = Study.get_all()
        return {"message": "Emergency service requested successfully"}
    except HTTPException as http_exception:
        return JSONResponse(
            status_code=http_exception.status_code,
            content={"detail": http_exception.detail},
        )
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
    

@router.get(
    "/all-emergencies",
    response_model=List[EmergencyServiceResponse],
    responses={
        200: {"description": "List of all emergency services"},
        500: {"description": "Internal server error"},
    },
)
def get_all_emergency_services():
    """
    Get all emergency service requests.

    This will retrieve all emergency service requests stored in Firestore.
    """
    try:
        services = Service.get_pending_services()
        print(services)
        return services
    except Exception as e:
        print(f"Error fetching emergency services: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
    

@router.post(
    "/emergency/accept",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulRequestResponse,
    responses={
        400: {"model": RequestErrorResponse},
        403: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def accept_emergency_service(
    request: AcceptServiceRequest,
):
    """
    Accept an emergency service.

    This will allow professionals to accept an emergency service.

    This path operation will:

    * Accept an emergency service.
    * Raise an error if something fails.
    """
    try:
        service_ref = db.collection("services").document(request.serviceId)
        service_doc = service_ref.get()

        if not service_doc.exists:
            raise HTTPException(status_code=404, detail="Servicio no encontrado")

        # Actualizar Firestore con el email del profesional y el nuevo status
        service_ref.update({
            "professional": request.professionalEmail,
            "status": "accepted"
        })

        return {"message": "Servicio aceptado con éxito", "serviceId": request.serviceId}
    except HTTPException as http_exception:
        return JSONResponse(
            status_code=http_exception.status_code,
            content={"detail": http_exception.detail},
        )
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
    
@router.get(
    "/emergency/active/{userEmail}",
    status_code=status.HTTP_200_OK,
    response_model=ActiveServiceResponse,
    responses={
        400: {"model": RequestErrorResponse},
        403: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def get_active_emergency_service(userEmail: str):
    """
    Get the active emergency service (status: accepted) for a user or professional.
    """
    try:
        services_ref = db.collection("services")

        # Consulta para el usuario que solicitó el servicio
        user_query = services_ref.where("status", "==", "accepted").where("userEmail", "==", userEmail).limit(1)
        user_results = user_query.stream()

        # Consulta para el usuario que es profesional en el servicio
        professional_query = services_ref.where("status", "==", "accepted").where("professional", "==", userEmail).limit(1)
        professional_results = professional_query.stream()

        # Unimos los resultados en una lista
        active_service = None
        for service in user_results:
            active_service = service.to_dict()
            active_service["id"] = service.id
            break  # Solo tomamos el primer resultado

        if not active_service:
            for service in professional_results:
                active_service = service.to_dict()
                active_service["id"] = service.id
                break  # Solo tomamos el primer resultado

        if not active_service:
            return {"activeService": None}

        return {"activeService": active_service}
    
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Internal server error: {str(e)}"},
        )