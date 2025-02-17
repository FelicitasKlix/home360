from enum import Enum
from pydantic import BaseModel


class SuccessfulRequestResponse(BaseModel):
    message: str

class RequestErrorResponse(BaseModel):
    detail: str

class EmergencyServiceResponse(BaseModel):
    id: str
    description: str
    location: str
    category: str
    created_at: str