import requests
import json
import os
from dotenv import load_dotenv
from typing import Union, Annotated
import httpx

from fastapi import APIRouter, status, Depends, Body, HTTPException
from fastapi.responses import JSONResponse

from app.models.entities.Auth import Auth
from app.models.entities.User import User
from app.models.entities.Professional import Professional

from firebase_admin import firestore, auth
from firebase_admin.exceptions import FirebaseError

from app.models.responses.UserResponses import (
    SuccessfulLoginResponse,
    LoginErrorResponse,
    SuccessfullRegisterResponse,
    RegisterErrorResponse,
    UserProfileErrorResponse,
    UserInfoErrorResponse,
    SuccessfullChangePasswordResponse,
    ChangePasswordErrorResponse,
    UserTypeResponse,
    DeviceTokenRepsonse,
    UserAllInfoResponse
)

from app.models.responses.RewardResponses import(
    SuccessfulRewardsResponse,
    RewardsErrorResponse
)

from app.models.requests.UserRequests import (
    UserLoginRequest,
    UserRegisterRequest,
    ChangePasswordRequest,
    ProfessionalRegisterRequest,
    DeviceTokenRequest,
)

from app.models.requests.NotificationsRequests import (NotificationRequest, ChatNotificationRequest)
from app.models.responses.NotificationResponses import (
    SuccessfullNotificationResponse,
)

db = firestore.client()

load_dotenv()

router = APIRouter(
    prefix="/users", tags=["Users"], responses={404: {"description": "Not found"}}
)

with open("credentials/client.json") as fp:
    firebase_client_config = json.loads(fp.read())

SECRET_SHARED_TOKEN = os.environ.get("SECRET_SHARED_TOKEN")
EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send"

@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulLoginResponse,
    responses={
        400: {"model": LoginErrorResponse},
        403: {"model": LoginErrorResponse},
        500: {"model": LoginErrorResponse},
    },
)
async def login_user(
    user_login_request: UserLoginRequest
):
    """
    Login a user.

    This will allow for authenticated clients to log into the system.

    This path operation will:

    * Login the user, performing validations on data received and on its validity.
    * Return the users Bearer token if login is successful.
    * Throw an error if login fails.
    """
    url = os.environ.get("LOGIN_URL")
    login_response = requests.post(
        url,
        json={
            "email": user_login_request.email,
            "password": user_login_request.password,
            "return_secure_token": True,
        },
        params={"key": firebase_client_config["apiKey"]},
    )
    if login_response.status_code == 400:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Invalid email and/or password"},
        )
    elif login_response.status_code == 200:
        if Professional.is_professional(user_login_request.email):
            professional = Professional.get_professionals_by_email(user_login_request.email)
            
            if professional['approved'] == "denied" or professional['approved'] == "blocked" or professional['approved'] == "pending":
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "Account is not approved"},
            )
        
        return {"token": login_response.json()["idToken"]}
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error"},
    )


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessfullRegisterResponse,
    responses={
        400: {"model": RegisterErrorResponse},
        403: {"model": RegisterErrorResponse},
        500: {"model": RegisterErrorResponse},
    },
)
async def register(
    register_request: Annotated[
        Union[UserRegisterRequest, ProfessionalRegisterRequest],
        Body(discriminator="role"),
    ]
):
    """
    Register a user.
    This will allow users to register on the platform.
    This path operation will:
    * Register users, performing validations on data received and on its validity.
    * If the user is a common user, it's record will be created.
    * Throw an error if registration fails.
    """

    url = os.environ.get("REGISTER_URL")
    auth_uid = None
    try:
        user = auth.get_user_by_email(register_request.email)
        auth_uid = user.uid
    except:
        print("[+] User doesnt exist in authentication")

    if not auth_uid:
        try:
            register_response = auth.create_user(
                **{
                    "email": register_request.email,
                    "password": register_request.password,
                }
            )
            auth_uid = register_response.uid
        except Exception as e:
            print("[+] Firebase user creation failed:", str(e))
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": f"Error creating user: {str(e)}"},
            )

    del register_request.password
    print(register_request.role)
    if register_request.role == "user":
        user_data = {
            key: value
            for key, value in register_request.model_dump().items()
        }
        user = User(**user_data, id=auth_uid)
        user.create()
       
    elif register_request.role == "professional":
        print("Creating professional with data:", register_request.model_dump(exclude_none=True))
        professional = Professional(
            **register_request.model_dump(exclude_none=True), id=auth_uid
        )
        professional.create()
       
    return {"message": "Successfull registration"}
    

@router.get(
    "/user-type/{user_email}",
    status_code=status.HTTP_200_OK,
    response_model=UserTypeResponse,
    responses={
        401: {"model": UserProfileErrorResponse},
        403: {"model": UserProfileErrorResponse},
        500: {"model": UserProfileErrorResponse},
    },
)
def get_user_type(user_email: str):
    """
    Get a users roles.

    This will return the users roles.

    This path operation will:

    * Return the users roles.
    * Throw an error if users role retrieving process fails.
    """
    try:
        if User.is_user(user_email):
            return {"type": "user"}
        if Professional.is_professional(user_email):
            return {"type": "professional"}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

@router.get(
    "/user-all-info/{user_email}",
    status_code=status.HTTP_200_OK,
    response_model=UserAllInfoResponse,
    responses={
        401: {"model": UserInfoErrorResponse},
        403: {"model": UserInfoErrorResponse},
        500: {"model": UserInfoErrorResponse},
    },
)
def get_user_info(user_email: str):
    """
    Get a user info.

    This will return the user info.

    This path operation will:

    * Return the user info.
    * Throw an error if user info retrieving process fails.
    """
    try:
        if Professional.is_professional(user_email):
            professional = Professional.get_professionals_by_email(user_email)
            return professional
        if User.is_user(user_email):
            user = User.get_users_by_email(user_email)
            return user
        else:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
            )
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

@router.get(
    "/user-info/{receiver_email}",
    status_code=status.HTTP_200_OK,
    response_model=str,
    responses={
        401: {"model": UserInfoErrorResponse},
        403: {"model": UserInfoErrorResponse},
        500: {"model": UserInfoErrorResponse},
    },
)
def get_user_info(receiver_email: str):
    """
    Get a user info.

    This will return the user info.

    This path operation will:

    * Return the user info.
    * Throw an error if user info retrieving process fails.
    """
    try:
        if Professional.is_professional(receiver_email):
            professional = Professional.get_professionals_by_email(receiver_email)
            return professional['first_name']
        if User.is_user(receiver_email):
            user = User.get_users_by_email(receiver_email)
            return user['first_name']
        else:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
            )
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
    

@router.post(
    "/device-token",
    status_code=status.HTTP_200_OK,
    response_model=str,
    responses={
        401: {"model": UserInfoErrorResponse},
        403: {"model": UserInfoErrorResponse},
        500: {"model": UserInfoErrorResponse},
    },
)
def save_device_token(device_token_request: DeviceTokenRequest,):
    """
    Post a device token.

    This will return the status.

    This path operation will:

    * Return the status.
    * Throw an error if the process fails.
    """
    try:
        print("Recibido en backend:", {
            "email": device_token_request.user_email,
            "token": device_token_request.device_token
        })
        email = device_token_request.user_email
        token = device_token_request.device_token

        if Professional.is_professional(email):
            Professional.add_device_token(email, token)
        elif User.is_user(email):
            User.add_device_token(email, token)
        else:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": "Usuario no encontrado"}
            )
        
        return "Token guardado correctamente"

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Error interno del servidor: {str(e)}"},
        )

@router.get(
    "/get-device-token/{user_email}",
    status_code=status.HTTP_200_OK,
    response_model=str,
    responses={
        401: {"model": DeviceTokenRepsonse},
        403: {"model": DeviceTokenRepsonse},
        500: {"model": DeviceTokenRepsonse},
    },
)
def get_device_token(user_email: str):
    """
    Get a device token.

    This will return the status.

    This path operation will:

    * Return the device token.
    * Throw an error if the process fails.
    """
    try:

        if Professional.is_professional(user_email):
            token = Professional.get_device_token(user_email)
        elif User.is_user(user_email):
            token = User.get_device_token(user_email)
        else:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": "Usuario no encontrado"}
            )
        
        return token

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Error interno del servidor: {str(e)}"},
        )

@router.post(
    "/change-password-user",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullChangePasswordResponse,
    responses={
        400: {"model": ChangePasswordErrorResponse},
        401: {"model": ChangePasswordErrorResponse},
    },
)
def change_password(
    change_password_request: ChangePasswordRequest
):
    """
    Change users password.

    This will allow authenticated users to change their passwords.

    This path operation will:

    * Change users password.
    * Raise an error if password change fails.
    """
    try:
        email = change_password_request.email.lower()
        user = auth.get_user_by_email(email)

    except FirebaseError as e:
        print(f"Error de Firebase: {e}")
        raise HTTPException(status_code=500, detail="Error al cambiar la contraseña.")
    
    url = os.environ.get("LOGIN_URL")
    login_response = requests.post(
        url,
        json={
            "email": user.email,
            "password": change_password_request.current_password,
        },
        params={"key": firebase_client_config["apiKey"]},
    )
    
    if login_response.status_code == 200:
        auth.update_user(user.uid, password=change_password_request.new_password)
        return {"message": "Password changed successfully"}
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Invalid current password"},
    )

async def send_expo_notification(token: str, title: str, body: str):
    try:
        async with httpx.AsyncClient() as client:
            message = {
                "to": token,
                "sound": "default",
                "title": title,
                "body": body,
                "data": { "someData": "goes here" }
            }
            
            response = await client.post(EXPO_PUSH_API_URL, json=message)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/send-notification",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullNotificationResponse
)
async def send_push_notification(notification_request: NotificationRequest):
    try:
        print(notification_request.userEmail)
        userEmail = notification_request.userEmail
        
        docs = db.collection("users").where("email", "==", userEmail).stream()
        token = None
        for doc in docs:
            token = doc.to_dict().get("device_token")
            break
            
        if not token:
            raise HTTPException(status_code=404, detail="No se encontró token para este usuario")
            
        response = await send_expo_notification(
            token=token,
            title="Notificación de prueba",
            body="¡Hola! Esto es una prueba de push notification en Home360."
        )
        print(response)
        return {"message": "Notificación enviada exitosamente"}
        
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Error al enviar notificación: {str(e)}"}
        )
    
@router.post(
    "/send-notifications",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullNotificationResponse
)
async def send_push_notifications(notification_request: ChatNotificationRequest):
    try:
        print(notification_request)
        userEmail = notification_request.userEmail
        message = notification_request.message
        
        docs = db.collection("users").where("email", "==", userEmail).stream()
        token = None
        for doc in docs:
            token = doc.to_dict().get("device_token")
            break

        if not token:
            docs = db.collection("professionals").where("email", "==", userEmail).stream()
            for doc in docs:
                token = doc.to_dict().get("device_token")
                break

        if not token:
            raise HTTPException(status_code=404, detail="No se encontró token para este usuario")
            
        # Enviar notificación usando Expo
        response = await send_expo_notification(
            token=token,
            title="Nuevo mensaje",
            body=message
        )
        print(response)
        return {"message": "Notificación enviada exitosamente"}
        
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Error al enviar notificación: {str(e)}"}
        )
    
@router.get(
    "/reviews/{user_email}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulRewardsResponse,
    responses={
        401: {"model": RewardsErrorResponse},
    },
)
def get_user_rewards(user_email: str):
    """
    Get the rewards (sellos obtenidos) of the user.
    """
    try:
        rewards = User.fetch_rewards_for_user(user_email)
        return {"amount": rewards}
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Error retrieving rewards: {str(e)}"}
        )


@router.get("/rewards/{email}")
async def fetch_rewards_for_user(email: str):
    try:
        user_ref = db.collection("users").where("email", "==", email).get()
        if not user_ref:
            user_ref = db.collection("professionals").where("email", "==", email).get()
        
        if not user_ref:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        user_data = user_ref[0].to_dict()
        rewards = user_data.get("rewards", 0)

        return {"amount": rewards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
