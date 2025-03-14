import re
from pydantic import BaseModel, Field, field_validator
from typing import Annotated, Literal
from fastapi import Query


class UserLoginRequest(BaseModel):
    email: Annotated[str, Query(pattern="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str


class UserRegisterRequest(BaseModel):
    role: Literal["user"] = "user"
    name: str = Field(min_length=1)
    phone: str
    #last_name: str = Field(min_length=1)
    email: Annotated[str, Query(pattern="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str = Field(
        min_length=8,
        description="Must contain at least one uppercase, at least one lowercase and at least one number",
    )

    @field_validator("password")
    def validate_password(cls, password_to_validate):
        if not re.search(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)", password_to_validate):
            raise ValueError("Invalid password format")
        return password_to_validate


class PhysicianRegisterRequest(BaseModel):
    role: Literal["physician"] = "physician"
    name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: Annotated[str, Query(pattern="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str = Field(
        min_length=8,
        description="Must contain at least one uppercase, at least one lowercase and at least one number",
    )
    tuition: str
    specialty: str


class ProfessionalRegisterRequest(BaseModel):
    role: Literal["professional"] = "professional"
    name: str = Field(min_length=1)
    #last_name: str = Field(min_length=1)
    phone:str
    email: Annotated[str, Query(pattern="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str = Field(
        min_length=8,
        description="Must contain at least one uppercase, at least one lowercase and at least one number",
    )
    tuition: str
    specialty: list
    birth_date: str
    zones: list
    

    @field_validator("password")
    def validate_password(cls, password_to_validate):
        if not re.search(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)", password_to_validate):
            raise ValueError("Invalid password format")
        return password_to_validate

class LaboratoryRegisterRequest(BaseModel):
    role: Literal["laboratory"] = "laboratory"
    name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: Annotated[str, Query(pattern="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str = Field(
        min_length=8,
        description="Must contain at least one uppercase, at least one lowercase and at least one number",
    )

    @field_validator("password")
    def validate_password(cls, password_to_validate):
        if not re.search(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)", password_to_validate):
            raise ValueError("Invalid password format")
        return password_to_validate
    
class ChangePasswordRequest(BaseModel):
    email: str
    current_password: str
    new_password: str = Field(
        min_length=8,
        description="Must contain at least one uppercase, at least one lowercase and at least one number",
    )

    @field_validator("new_password")
    def validate_password(cls, password_to_validate):
        if not re.search(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)", password_to_validate):
            raise ValueError("Invalid password format")
        return password_to_validate


class DeviceTokenRequest(BaseModel):
    user_email: str
    device_token: str