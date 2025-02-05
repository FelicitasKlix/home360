from enum import Enum
from pydantic import BaseModel


class SuccessfulRequestResponse(BaseModel):
    message: str

class RequestErrorResponse(BaseModel):
    detail: str