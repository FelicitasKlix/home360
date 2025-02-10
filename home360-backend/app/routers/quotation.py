import json
import os
from dotenv import load_dotenv
from typing import Union, Annotated
from fastapi import APIRouter, status, Depends, Body, HTTPException
from fastapi.responses import JSONResponse
from app.models.entities.Quotation import Quotation
from app.models.entities.Professional import Professional
from app.models.entities.Patient import Patient
from firebase_admin import firestore, auth
from app.models.responses.QuotationResponses import (
    SuccessfulRequestResponse,
    RequestErrorResponse,
    QuotationResponse,
    QuotationStatusResponse
)
from app.models.requests.QuotationRequests import (
    QuotationRequest
)

db = firestore.client()
load_dotenv()

router = APIRouter(
    prefix="/quotation", 
    tags=["Quotation"], 
    responses={404: {"description": "Not found"}}
)

with open("credentials/client.json") as fp:
    firebase_client_config = json.loads(fp.read())

SECRET_SHARED_TOKEN = os.environ.get("SECRET_SHARED_TOKEN")

@router.post(
    "",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulRequestResponse,
    responses={
        400: {"model": RequestErrorResponse},
        403: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def create_quotation(
    quotation_request: QuotationRequest,
    #uid=Depends(Auth.is_logged_in),
):
    """
    Creates a new quotation request.
    This will allow users to request a quotation from a professional.
    This path operation will:
    * Create a new quotation request
    * Store it in the database
    * Return a success message or raise an error if something fails
    """
    quotation = Quotation(
        **{**quotation_request.model_dump()}
    )
    
    try:
        print(quotation)
        quotation.create()
        return {"message": "Quotation created successfully"}
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
    "/{userEmail}",
    response_model=QuotationStatusResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def get_quotations(userEmail: str):
    """
    Retrieves all the quotations for a user.
    This will allow users to request all of their quotations.
    This path operation will:
    * Request all quotations for a user
    * Return a success message or raise an error if something fails
    """
    try:
        print(userEmail)
        if Professional.is_professional(userEmail):
            quotations = Quotation.get_by_professional_email(userEmail)
        if Patient.is_patient(userEmail):
            quotations = Quotation.get_by_user_email(userEmail)
        print(quotations)
        response_data = {
            "pending": [],
            "completed": [],
            "rejected": []
        }

        for quotation in quotations:
            if quotation["status"] == "pending":
                response_data["pending"].append(quotation)
            elif quotation["status"] == "completed":
                response_data["completed"].append(quotation)
            elif quotation["status"] == "rejected":
                response_data["rejected"].append(quotation)

        return response_data

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": str(e)},
        )