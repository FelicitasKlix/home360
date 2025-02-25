import requests
import json
import os
from dotenv import load_dotenv
from typing import Union, Annotated
import httpx

from fastapi import APIRouter, status, Depends, Body, HTTPException
from fastapi.responses import JSONResponse

from app.models.entities.Auth import Auth
from app.models.entities.Admin import Admin
from app.models.entities.Patient import Patient
from app.models.entities.Professional import Professional
from app.models.entities.Physician import Physician
from app.models.entities.Score import Score
from app.models.entities.Appointment import Appointment
from app.models.responses.PatientResponses import PatientResponse
from app.models.responses.PhysicianResponses import PhysicianResponse

from firebase_admin import firestore, auth, messaging

from app.models.responses.UserResponses import (
    SuccessfulLoginResponse,
    LoginErrorResponse,
    SuccessfullRegisterResponse,
    RegisterErrorResponse,
    UserRolesResponse,
    UserProfileErrorResponse,
    UserInfoErrorResponse,
    IsLoggedInResponse,
    SuccessfullChangePasswordResponse,
    ChangePasswordErrorResponse,
    UserTypeResponse
)

from app.models.responses.ProfessionalResponses import ProfessionalResponse

from app.models.requests.UserRequests import (
    UserLoginRequest,
    UserRegisterRequest,
    PhysicianRegisterRequest,
    ChangePasswordRequest,
    ProfessionalRegisterRequest,
    DeviceTokenRequest
)

from app.models.requests.NotificationsRequests import NotificationRequest
from app.models.responses.NotificationResponses import (
    SuccessfullNotificationResponse,
    ErrorNotificationResponse
)

from app.models.responses.ScoreResponses import (
    SuccessfullLoadScoreResponse,
    ScoreErrorResponse,
    SuccessfullScoreResponse,
    PendingScoresErrorResponse,
    PendingScoresResponse,
)

from app.models.requests.ScoreRequests import (
    LoadScoreRequest,
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
    user_login_request: UserLoginRequest,
    #token=Depends(Auth.has_bearer_token),
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
            #print(professional[0])
            if professional['approved'] == "denied" or professional['approved'] == "blocked" or professional['approved'] == "pending":
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "Account is not approved"},
            )
        #if Professional.is_professional(login_response.json()["localId"]):
       # if not Professional.is_professional_approved_by_email(user_login_request.email):
            #return JSONResponse(
              #  status_code=status.HTTP_403_FORBIDDEN,
               # content={"detail": "Account is not approved"},
            #)
        #if Professional.is_professional(user_login_request.email):
         #   #physician = Physician.get_by_id(login_response.json()["localId"])
          #  if physician["approved"] == "denied" or physician["approved"] == "blocked":
           #     return JSONResponse(
            #        status_code=status.HTTP_403_FORBIDDEN,
             #       content={"detail": "Account is not approved"},
              #  )
            #elif physician["approved"] == "pending":
             #   return JSONResponse(
              #      status_code=status.HTTP_403_FORBIDDEN,
               #     content={"detail": "Account has to be approved by admin"},
                #)
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
    * If the user is a patient, it's record will be created.
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
        #except:
            #return JSONResponse(
             #   status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
              #  content={"detail": "Internal Server Error"},
            #)

    del register_request.password
    print(register_request.role)
    if register_request.role == "user":
        patient_data = {
            key: value
            for key, value in register_request.model_dump().items()
            #if key not in ["birth_date", "gender", "blood_type"]
        }
        patient = Patient(**patient_data, id=auth_uid)
        patient.create()
        #record_data = {
            #key: value
            #for key, value in register_request.model_dump().items()
            #if key not in ["role", "email"]
        #}
        #record = Record(**record_data, id=auth_uid)
        #record.create()
        #email_type = "PATIENT_REGISTERED_ACCOUNT"
    elif register_request.role == "professional":
        print("Creating professional with data:", register_request.model_dump(exclude_none=True))
        professional = Professional(
            **register_request.model_dump(exclude_none=True), id=auth_uid
        )
        professional.create()
        #email_type = "PHYSICIAN_REGISTERED_ACCOUNT"
    '''
    requests.post(
        "http://localhost:9000/emails/send",
        #"https://two023-kmk-45yo.onrender.com/emails/send",
        json={
            "type": email_type,
            "data": {
                "name": register_request.name,
                "last_name": register_request.last_name,
                "email": register_request.email,
            },
        },
        headers={"X-API-Key": SECRET_SHARED_TOKEN}
    )'''
    return {"message": "Successfull registration"}


@router.get(
    "/role",
    status_code=status.HTTP_200_OK,
    response_model=UserRolesResponse,
    responses={
        401: {"model": UserProfileErrorResponse},
        403: {"model": UserProfileErrorResponse},
        500: {"model": UserProfileErrorResponse},
    },
)
def get_user_roles(user_id=Depends(Auth.is_logged_in) ):
    """
    Get a users roles.

    This will return the users roles.

    This path operation will:

    * Return the users roles.
    * Throw an error if users role retrieving process fails.
    """
    roles = []
    try:
        if Admin.is_admin(user_id):
            roles.append("admin")
        if Patient.is_patient(user_id):
            roles.append("patient")
        if Physician.is_physician(user_id):
            roles.append("physician")
        return {"roles": roles}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
    

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
    #roles = []
    try:
        #if Admin.is_admin(user_email):
            #roles.append("admin")
        if Patient.is_patient(user_email):
            #roles.append("user")
            return {"type": "user"}
        if Professional.is_professional(user_email):
            #roles.append("professional")
            return {"type": "professional"}
        #return {"roles": roles}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.get(
    "/user-info/{receiver_email}",
    status_code=status.HTTP_200_OK,
    #response_model=Union[ProfessionalResponse, PatientResponse],
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
        if Patient.is_patient(receiver_email):
            patient = Patient.get_patients_by_email(receiver_email)
            return patient['first_name']
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
    #response_model=Union[ProfessionalResponse, PatientResponse],
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
        elif Patient.is_patient(email):
            Patient.add_device_token(email, token)
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
    "/is-logged-in", status_code=status.HTTP_200_OK, response_model=IsLoggedInResponse
)
def is_logged_in(token=Depends(Auth.get_bearer_token)):
    """
    Get a users logged in status.

    This will return the users logged in status.

    This path operation will:

    * Return True if user is logged in.
    * Return False if user is not logged in.
    """
    if token:
        try:
            auth.verify_id_token(token.credentials)
            return {"is_logged_in": True}
        except:
            return {"is_logged_in": False}
    return {"is_logged_in": False}


@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullChangePasswordResponse,
    responses={
        400: {"model": ChangePasswordErrorResponse},
        401: {"model": ChangePasswordErrorResponse},
    },
)
def change_password(
    change_password_request: ChangePasswordRequest, uid=Depends(Auth.is_logged_in)
):
    """
    Change users password.

    This will allow authenticated users to change their passwords.

    This path operation will:

    * Change users password.
    * Raise an error if password change fails.
    """
    user = auth.get_user(uid)
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
        auth.update_user(uid, **{"password": change_password_request.new_password})
        requests.post(
            "http://localhost:9000/emails/send",
            #"https://two023-kmk-45yo.onrender.com/emails/send",
            json={
                "type": "PASSWORD_CHANGED",
                "data": {
                    "email": user.email,
                },
            },
            headers={"X-API-Key": SECRET_SHARED_TOKEN}
        )
        return {"message": "Password changed successfully"}
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Invalid current password"},
    )

'''
@router.post(
    "/send-notification",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullNotificationResponse,
    responses={
        400: {"model": ErrorNotificationResponse},
        401: {"model": ErrorNotificationResponse},
    },
)
def send_push_notification(notification_request: NotificationRequest):
    """
    Send push notification.

    This will send notifications to users by email.

    This path operation will:

    * Send notifications to users.
    * Raise an error if anything fails.
    """
    try:
        print(notification_request)
        userEmail = notification_request.userEmail
        print(userEmail)
        # Buscar el token del usuario en Firestore
        docs = db.collection("patients").where("email", "==", userEmail).stream()
        token = None
        for doc in docs:
            token = doc.to_dict().get("device_token")
            print(token)
            break

        if not token:
            raise HTTPException(status_code=404, detail="No se encontró token para este usuario")

        # Construir el mensaje de notificación
        message = messaging.Message(
            notification=messaging.Notification(
                title="Notificación de prueba",
                body="¡Hola! Esto es una prueba de push notification en Home360."
            ),
            token=token
        )
        print(message)
        # Enviar la notificación
        response = messaging.send(message)
        print(response)
        #return {"message": "Notificación enviada", "response": response}
        return {"message": "Notificación enviada"}
    except Exception as e:
            print("Error:", str(e))
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": f"Error creating user: {str(e)}"},
            )
    #except Exception as e:
        #raise HTTPException(status_code=500, detail=f"Error enviando notificación: {str(e)}")
    
'''

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
        userEmail = notification_request.userEmail
        
        # Buscar el token del usuario en Firestore
        docs = db.collection("patients").where("email", "==", userEmail).stream()
        token = None
        for doc in docs:
            token = doc.to_dict().get("device_token")
            break
            
        if not token:
            raise HTTPException(status_code=404, detail="No se encontró token para este usuario")
            
        # Enviar notificación usando Expo
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
    "/add-score",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullLoadScoreResponse,
    responses={
        400: {"model": ScoreErrorResponse},
        401: {"model": ScoreErrorResponse},
    },
)
def add_score(add_score_request: LoadScoreRequest, uid=Depends(Auth.is_logged_in)):
    """
    Add score.

    This will allow authenticated users to add scores.

    This path operation will:

    * Add score.
    * Raise an error if password change fails.
    """
    add_score_request = add_score_request.model_dump(exclude_none=True)
    appointment_id = add_score_request.pop("appointment_id")
    try:
        print(add_score_request)
        print(appointment_id)
        if Patient.get_by_id(uid):
            Score.add_physician_score(add_score_request, appointment_id)
            Appointment.update_rated_status(appointment_id)
            return {"message": "Scores added successfully"}
        if Physician.get_by_id(uid):
            Score.add_patient_score(add_score_request, appointment_id)
            return {"message": "Scores added successfully"}
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
    "/score/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullScoreResponse,
    responses={
        400: {"model": ScoreErrorResponse},
        401: {"model": ScoreErrorResponse},
    },
)
def show_score(
    user_id: str,
    uid=Depends(Auth.is_logged_in)
):
    """
    Show scores from a physician.

    This will allow authenticated users to see physician scores.

    This path operation will:

    * Show physician scores.
    * Raise an error if password change fails.
    """
    try:
        if Patient.is_patient(user_id):
            appointments = Appointment.get_all_rated_appointments_for_patient_with(
                user_id
            )
            print(appointments)
            score_sums = {
                "puntuality": 0,
                "communication": 0,
                "attendance": 0,
                "treat": 0,
                "cleanliness": 0,
            }
            score_counts = {
                "puntuality": 0,
                "communication": 0,
                "attendance": 0,
                "treat": 0,
                "cleanliness": 0,
            }
            scores = []
            for appt in appointments:
                score = Score.get_by_id(appt["id"])
                scores.append(score["patient_score"][0])

        if Physician.is_physician(user_id):
            appointments = Appointment.get_all_rated_appointments_for_physician_with(
                user_id
            )
            score_sums = {
                "puntuality": 0,
                "attention": 0,
                "cleanliness": 0,
                "availability": 0,
                "price": 0,
                "communication": 0,
            }
            score_counts = {
                "puntuality": 0,
                "attention": 0,
                "cleanliness": 0,
                "availability": 0,
                "price": 0,
                "communication": 0,
            }
            scores = []
            for appt in appointments:
                score = Score.get_by_id(appt["id"])
                if len(score["physician_score"]) > 0:
                    scores.append(score["physician_score"][0])

        for score in scores:
            for key, value in score.items():
                if key in score_sums:
                    score_sums[key] += value
                    score_counts[key] += 1

        score_averages = {}
        for key, value in score_sums.items():
            if score_counts[key] > 0:
                score_averages[key] = value / score_counts[key]
            else:
                score_averages[key] = "No hay reviews"

        print(score_averages)

        return {"score_metrics": score_averages}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.get(
    "/patient-pending-scores",
    status_code=status.HTTP_200_OK,
    response_model=PendingScoresResponse,
    responses={
        400: {"model": PendingScoresErrorResponse},
        401: {"model": PendingScoresErrorResponse},
    },
)
def pending_scores(user_id=Depends(Auth.is_logged_in)):
    """
    Get pending scores for a patient.

    This will allow us to check if a patient has pending scores.

    This path operation will:

    * Check for pending scores.
    * Return a list of pending scores.
    * Raise an error if password change fails.
    """
    try:
        appointments = Appointment.get_all_closed_appointments_for_patient_with(user_id)
        pending_scores = []
        for appointment in appointments:
            physician = Physician.get_by_id(appointment["physician_id"])
            physician_info = {
                "first_name": physician["first_name"],
                "last_name": physician["last_name"],
                "specialty": physician["specialty"],
            }
            appointment.update(physician_info)
            pending_scores.append(appointment)

        return {"pending_scores": pending_scores}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
