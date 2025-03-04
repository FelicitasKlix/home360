import re
from pydantic import BaseModel, Field, field_validator
from typing import Annotated, Literal, Union, List
from fastapi import Query


class EmergencyServiceRequest(BaseModel):
    userEmail: str
    description: str
    location: list
    category: list
    #user_id: str

class AcceptServiceRequest(BaseModel):
    serviceId: str
    professionalEmail: str