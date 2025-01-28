import re
from pydantic import BaseModel, Field, field_validator
from typing import Annotated, Literal, Union
from fastapi import Query


class LoadScoreRequest(BaseModel):
    appointment_id: str
    puntuality: Union[int, None] = None
    communication: Union[int, None] = None
    attendance: Union[int, None] = None
    treat: Union[int, None] = None
    cleanliness: Union[int, None] = None
    availability: Union[int, None] = None
    price: Union[int, None] = None
    attention: Union[int, None] = None
