from pydantic import BaseModel, Field, field_validator
from typing import Annotated, Literal, Union, List
from fastapi import Query

class QuotationRequest(BaseModel):
    professionalEmail: str
    userEmail: str
    category: str
    description: str
    direccion: str
    id: str
    status: str = "pending"

    @field_validator('description')
    def description_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Description cannot be empty')
        return v

    @field_validator('direccion')
    def direccion_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Location cannot be empty')
        return v

    @field_validator('status')
    def validate_status(cls, v):
        valid_statuses = ['pending', 'accepted', 'rejected', 'completed']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v
    

class QuotationUpdateItem(BaseModel):
    descripcion: str
    monto: float

class QuotationUpdateRequest(BaseModel):
    quotation: List[QuotationUpdateItem]