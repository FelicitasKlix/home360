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


class GetProfessionalsResponse(BaseModel):
    professionals: list[Union[ProfessionalResponse, None]]


class GetProfessionalsError(BaseModel):
    detail: str
