import os
import uvicorn
from dotenv import load_dotenv
from .config import initialize_firebase_app

initialize_firebase_app()

from fastapi import FastAPI, status, Depends, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.utils import get_openapi
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html

# Importaciones para Socket.IO
#import socketio
#from app.sockets.chat_socket import setup_socket_events

#from app.sockets import sio_app

load_dotenv()

from app.routers import (users, services, specialties, professionals, quotation, chat, zones)
from app.models.entities.Auth import Auth

CTX_PORT: int = int(os.environ.get("PORT")) if os.environ.get("PORT") else 8080

# Configuración de Socket.IO
#sio = socketio.AsyncServer(
 #   async_mode='asgi',
  #  cors_allowed_origins='*'
#)

# Creación de la aplicación Socket.IO ASGI
#socket_app = socketio.ASGIApp(sio)

# Configuración de FastAPI
app = FastAPI(docs_url=None, redoc_url=None, openapi_url="/api/openapi.json")
#app.mount("/sockets", sio_app)

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"], 
    allow_credentials=True,
)

# Configurar eventos de Socket.IO
#setup_socket_events(sio)

# Montar la aplicación Socket.IO en /socket.io
#app.mount('/socket.io', socket_app)

routers = [users.router, services.router, specialties.router, professionals.router, quotation.router, chat.router, zones.router]

for router in routers:
    app.include_router(router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder(
            {
                "detail": "Invalid input format",  # optionally include the errors
                "body": exc.body,
                "error": exc.errors(),
            }
        ),
    )


@app.get("/docs", response_class=HTMLResponse)
async def get_docs(username=Depends(Auth.is_kmk_maintainer)) -> HTMLResponse:
    return get_swagger_ui_html(openapi_url="/api/openapi.json", title="docs")


@app.get("/redoc", response_class=HTMLResponse)
async def get_redoc(username: str = Depends(Auth.is_kmk_maintainer)) -> HTMLResponse:
    return get_redoc_html(openapi_url="/api/openapi.json", title="redoc")


@app.get("/")
async def root() -> RedirectResponse:
    """
    Root endpoint,

    It returns the OPENAPI docs for the KMK API
    """
    #return RedirectResponse(url="/redoc", status_code=status.HTTP_303_SEE_OTHER)
    return {"message": "API is working"}


def start():
    """
    _summary_: Start the application
    """
    if os.environ.get("ENV") == "prod":
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=CTX_PORT,
            reload=True,
            ssl_keyfile="/etc/ssl/key.pem",
            ssl_certfile="/etc/ssl/cert.pem",
        )
    else:
        uvicorn.run("app.main:app", host="0.0.0.0", port=CTX_PORT, reload=True)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Home360 Mobile App",
        version="1.0.0",
        description="Docs for the Home360 API",
        routes=app.routes,
        tags=[
            {
                "name": "Users",
                "description": "Operations that handle users, like **login** and **signup**",
            },
            {
                "name": "Services",
                "description": "Operations that handle services (quotation and emergencies)",
            },
            {
                "name": "Specialties",
                "description": "Operations that handle specialties",
            },
            {
                "name": "Professionals",
                "description": "Operations that handle professionals",
            },
            {
                "name": "Admins",
                "description": "Operations that are handled by admins",
            },
            {
                "name": "Documents",
                "description": "Operations that handle image files",
            },
        ],
    )
    openapi_schema["info"]["x-logo"] = {
        "url": "https://firebasestorage.googleapis.com/v0/b/pid-kmk.appspot.com/o/appResources%2FmediSyncLogo.png?alt=media&token=5fa730e3-a5cb-4a65-ad71-88af0c72b65a"
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi