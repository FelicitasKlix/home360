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
    QuotationRequest,
    QuotationUpdateRequest
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
            "rejected": [],
            "cancelled": [],
            "in_progress": []
        }

        for quotation in quotations:
            if quotation["status"] == "pending":
                response_data["pending"].append(quotation)
            elif quotation["status"] == "completed":
                response_data["completed"].append(quotation)
            elif quotation["status"] == "rejected":
                response_data["rejected"].append(quotation)
            elif quotation["status"] == "cancelled":
                response_data["cancelled"].append(quotation)
            elif (quotation["status"] == "in progress") or (quotation["status"] == "pending_confirmation"):
                response_data["in_progress"].append(quotation)

        return response_data

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": str(e)},
        )
    
@router.post(
    "/update/{serviceId}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulRequestResponse,
    responses={
        400: {"model": RequestErrorResponse},
        404: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def update_quotation(
    serviceId: str,
    quotation_update: QuotationUpdateRequest
):
    """
    Updates a quotation with price and description.
    This allows professionals to provide a quote for a service request.
    
    This path operation will:
    * Validate the serviceId exists
    * Update the quotation with price information
    * Return a success message or raise an error if something fails
    """
    try:
        # Check if quotation exists
        quotation_doc = db.collection("quotations").document(serviceId).get()
        if not quotation_doc.exists:
            return HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )
        
        # Update the quotation with the pricing information
        db.collection("quotations").document(serviceId).update({
            "quotation": [item.dict() for item in quotation_update.quotation],
            #"status": "in progress"  # Change status to completed when price is provided
        })
        
        return {"message": "Quotation updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating quotation: {str(e)}"
        )
    
@router.post(
    "/reject/{serviceId}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulRequestResponse,
    responses={
        400: {"model": RequestErrorResponse},
        404: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def reject_quotation(serviceId: str):
    """
    Rejects a service request quotation.
    This allows professionals to decline a service request.
    
    This path operation will:
    * Validate the serviceId exists
    * Update the quotation status to rejected
    * Return a success message or raise an error if something fails
    """
    try:
        quotation_doc = db.collection("quotations").document(serviceId).get()
        if not quotation_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )
        
        Quotation.update_status(serviceId, "rejected")
        
        return {"message": "Quotation rejected successfully"}
    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error rejecting quotation: {str(e)}"
        )

@router.post(
    "/cancel/{serviceId}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulRequestResponse,
    responses={
        400: {"model": RequestErrorResponse},
        404: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def cancel_quotation(serviceId: str):
    """
    Cancels a service request quotation.
    This allows users to cancel their service request.
    
    This path operation will:
    * Validate the serviceId exists
    * Update the quotation status to cancelled
    * Return a success message or raise an error if something fails
    """
    try:
        quotation_doc = db.collection("quotations").document(serviceId).get()
        if not quotation_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )
        
        db.collection("quotations").document(serviceId).update({"status": "cancelled"})
        
        return {"message": "Quotation cancelled successfully"}
    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cancelling quotation: {str(e)}"
        )
    
@router.post(
    "/accept/{serviceId}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulRequestResponse,
    responses={
        400: {"model": RequestErrorResponse},
        404: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def accept_quotation(serviceId: str):
    """
    Accepts a service request quotation.
    This allows users to accept a professional's quote and move forward with the service.
    
    This path operation will:
    * Validate the serviceId exists
    * Update the quotation status to "in progress"
    * Return a success message or raise an error if something fails
    """
    try:
        quotation_doc = db.collection("quotations").document(serviceId).get()
        if not quotation_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )
        
        db.collection("quotations").document(serviceId).update({"status": "in progress"})
        
        return {"message": "Quotation accepted successfully"}
    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accepting quotation: {str(e)}"
        )
    
@router.get(
    "/details/{quotationId}",
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def get_quotation_details(quotationId: str):
    """
    Retrieves the details of a specific quotation.
    
    This path operation will:
    * Request the details of a quotation by ID
    * Return the quotation data or raise an error if something fails
    """
    try:
        quotation_data = Quotation.get_by_id(quotationId)
        if not quotation_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )
        print(quotation_data)
        return quotation_data
    except HTTPException as http_exception:
        raise http_exception
    
@router.post(
    "/completed/{serviceId}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulRequestResponse,
    responses={
        400: {"model": RequestErrorResponse},
        404: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def complete_quotation(serviceId: str):
    """
    Rejects a service request quotation.
    This allows professionals to decline a service request.
    
    This path operation will:
    * Validate the serviceId exists
    * Update the quotation status to rejected
    * Return a success message or raise an error if something fails
    """
    try:
        quotation_doc = db.collection("quotations").document(serviceId).get()
        if not quotation_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )
        
        Quotation.update_status(serviceId, "completed")
        
        return {"message": "Quotation rejected successfully"}
    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error rejecting quotation: {str(e)}"
        )
    
@router.post(
    "/completed-quotation/{serviceId}/{userType}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulRequestResponse,
    responses={
        400: {"model": RequestErrorResponse},
        404: {"model": RequestErrorResponse},
        500: {"model": RequestErrorResponse},
    },
)
def mark_work_completed(serviceId: str, userType: str):
    doc_ref = db.collection("quotations").document(serviceId)
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