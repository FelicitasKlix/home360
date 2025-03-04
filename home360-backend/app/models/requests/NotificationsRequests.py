from pydantic import BaseModel, Field, field_validator
from typing import Annotated, Literal, Union, List
from fastapi import Query

class NotificationRequest(BaseModel):
    userEmail: str

class ChatNotificationRequest(BaseModel):
    userEmail: str
    message: str