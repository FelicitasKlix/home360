from enum import Enum
from pydantic import BaseModel


class SuccessfulLoginResponse(BaseModel):
    token: str


class LoginErrorResponse(BaseModel):
    detail: str


class SuccessfullRegisterResponse(BaseModel):
    message: str


class SuccessfullChangePasswordResponse(BaseModel):
    message: str


class RegisterErrorResponse(BaseModel):
    detail: str


class IsLoggedInResponse(BaseModel):
    is_logged_in: bool


class ChangePasswordErrorResponse(BaseModel):
    detail: str


class UserRolesEnum(str, Enum):
    admin = "admin"
    physician = "physician"
    patient = "patient"
    laboratory = "laboratory"


class UserRolesResponse(BaseModel):
    roles: list[UserRolesEnum]

class UserTypeResponse(BaseModel):
    type: str

class UserProfileErrorResponse(BaseModel):
    detail: str

class UserInfoErrorResponse(BaseModel):
    detail: str
