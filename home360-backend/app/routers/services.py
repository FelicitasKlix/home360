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
    ActiveServiceResponse,
    CompletedEmergencyServiceResponse
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
    
@router.get(
    "/completed-emergencies",
    response_model=List[CompletedEmergencyServiceResponse],
    responses={
        200: {"description": "List of completed emergency services"},
        500: {"description": "Internal server error"},
    },
)
def get_completed_emergency_services():
    """
    Get completed emergency service requests.

    This will retrieve completed emergency service requests stored in Firestore.
    """
    try:
        services = Service.get_completed_services()
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
    
@router.post(
    "/completed-service/{serviceId}/{userType}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulRequestResponse,
    responses={
        400: {"model": RequestErrorResponse},
        404: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def mark_work_completed(serviceId: str, userType: str):
    doc_ref = db.collection("services").document(serviceId)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    data = doc.to_dict()
    confirmed_by = data.get("confirmedBy", [])

    if userType not in confirmed_by:
        confirmed_by.append(userType)

    if "professional" in confirmed_by and "user" in confirmed_by:
        status = "completed"
    else:
        status = "pending_confirmation"

    doc_ref.update({"status": status, "confirmedBy": confirmed_by})

    return {"message": f"Estado actualizado a {status}"}

@router.get("/status/{emergency_service_id}")
async def get_emergency_status(emergency_service_id: str):
    try:
        doc = db.collection("services").document(emergency_service_id).get()
        if doc.exists:
            data = doc.to_dict()
            return {
                "completed": data.get("status") == "completed",
                "markedBy": data.get("markedBy", [])
            }
        return {"completed": False, "markedBy": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/review")
async def submit_review(data: dict):
    try:
        service_id = data["service_id"]

        # Obtener la referencia al documento
        doc_ref = db.collection("services").document(service_id)
        doc = doc_ref.get()

        if doc.exists:
            current_review = doc.to_dict().get("review", {})
        else:
            current_review = {}

        # Construimos la actualización sin borrar los valores previos
        updated_review = {
            "review_for_user": data.get("review_for_user", current_review.get("review_for_user")),
            "points_for_user": data.get("points_for_user", current_review.get("points_for_user")),
            "review_for_professional": data.get("review_for_professional", current_review.get("review_for_professional")),
            "points_for_professional": data.get("points_for_professional", current_review.get("points_for_professional")),
        }

        doc_ref.update({"review": updated_review})

        return {"success": True, "message": "Review added"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))