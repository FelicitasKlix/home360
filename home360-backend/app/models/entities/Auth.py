import os
from dotenv import load_dotenv
from typing import Annotated
from fastapi import HTTPException, status, Depends
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
    HTTPBasicCredentials,
    HTTPBasic,
)
from firebase_admin import auth, firestore

from app.models.entities.Admin import Admin

load_dotenv()
db = firestore.client()

security = HTTPBasic()


class Auth:
    @staticmethod
    def get_bearer_token(
        token: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    ):
        return token

    @staticmethod
    def has_bearer_token(
        token: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    ):
        if token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has already logged in",
            )
        return False

    @staticmethod
    def is_logged_in(
        token: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    ):
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User must be logged in",
            )
        try:
            verified_token = auth.verify_id_token(token.credentials)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User must be logged in",
            )
        member = db.collection("physicians").document(verified_token["uid"]).get()
        if member.exists:
            if member.to_dict()["approved"] != "approved":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Physician must be approved by admin",
                )
        return verified_token["uid"]

    @staticmethod
    def is_admin(
        token: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    ):
        user_id = Auth.is_logged_in(token)
        if Admin.is_admin(user_id):
            return user_id
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User must be an admin",
            )

    @staticmethod
    def is_kmk_maintainer(
        credentials: Annotated[HTTPBasicCredentials, Depends(security)]
    ):
        if credentials.username != os.environ.get(
            "REDOC_USERNAME"
        ) or credentials.password != os.environ.get("REDOC_PASSWORD"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect Credentials",
                headers={"WWW-Authenticate": "Basic"},
            )
        return credentials.username
