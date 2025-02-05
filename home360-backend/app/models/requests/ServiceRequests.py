import re
from pydantic import BaseModel, Field, field_validator
from typing import Annotated, Literal, Union, List
from fastapi import Query


class EmergencyServiceRequest(BaseModel):
    description: str
    location: str
    category: str
    #user_id: str