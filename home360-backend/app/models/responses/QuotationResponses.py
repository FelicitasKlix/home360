from enum import Enum
from pydantic import BaseModel
from typing import List

class SuccessfulRequestResponse(BaseModel):
    message: str

class RequestErrorResponse(BaseModel):
    detail: str

class QuotationResponse(BaseModel):
    id: str
    professionalEmail: str
    userEmail: str
    category: str
    description: str
    direccion: str
    status: str
    created_at: str

class QuotationStatusResponse(BaseModel):
    pending: List[QuotationResponse]
    completed: List[QuotationResponse]
    rejected: List[QuotationResponse]
    cancelled: List[QuotationResponse]
    in_progress: List[QuotationResponse]