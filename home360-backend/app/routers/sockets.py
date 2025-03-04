import socketio
from typing import Callable

# Crear la instancia de Socket.IO que se compartirá
sio = socketio.Server(cors_allowed_origins='*', async_mode='eventlet')

# Eventos de Socket.IO
@sio.event
def connect(sid, environ):
    print(f"Cliente conectado: {sid}")

@sio.event
def join_room(sid, data):
    user_email = data.get('email')
    room = data.get('room')
    if user_email and room:
        sio.enter_room(sid, room)
        print(f"Usuario {user_email} entró a la sala {room}")

@sio.event
def disconnect(sid):
    print(f"Cliente desconectado: {sid}")

# Función para obtener la instancia de sio
def get_sio() -> socketio.Server:
    return sio

# Función para crear la aplicación WSGI de Socket.IO
def create_socketio_app() -> socketio.WSGIApp:
    return socketio.WSGIApp(sio)