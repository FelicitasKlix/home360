from pydantic import BaseModel
from typing import Union, List

class ProfessionalResponse(BaseModel):
    id: str
    first_name: str
    #last_name: str
    specialty: list
    email: str
    tuition: str
    zones: list
    average_score: float


class GetProfessionalsResponse(BaseModel):
    professionals: list[Union[ProfessionalResponse, None]]


class GetProfessionalsError(BaseModel):
    detail: str

class GetProfessionalReviews(BaseModel):
    reviews: list

class SuccessfulImageResponse(BaseModel):
    id: str
    file_name: str
    uploaded_at: int
    url: str

class ErrorImageResponse(BaseModel):
    detail: str