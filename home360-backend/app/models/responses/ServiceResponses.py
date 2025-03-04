from enum import Enum
from pydantic import BaseModel
from typing import Optional


class SuccessfulRequestResponse(BaseModel):
    message: str

class RequestErrorResponse(BaseModel):
    detail: str

class EmergencyServiceResponse(BaseModel):
    id: str
    description: str
    location: list
    category: list
    created_at: str

class ActiveServiceResponse(BaseModel):
    #message: str
    activeService: Optional[dict]