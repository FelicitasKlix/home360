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
    EmergencyServiceResponse
)

from app.models.requests.ServiceRequests import (
    EmergencyServiceRequest
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
    #uid=Depends(Auth.is_logged_in),
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