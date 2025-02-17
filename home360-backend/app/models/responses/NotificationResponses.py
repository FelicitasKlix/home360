from enum import Enum
from pydantic import BaseModel


class SuccessfullNotificationResponse(BaseModel):
    message: str


class ErrorNotificationResponse(BaseModel):
    detail: str