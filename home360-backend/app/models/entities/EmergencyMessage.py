from pydantic import BaseModel

class EmergencyMessage(BaseModel):
    message: str
    sender: str
    receiver: str
    emergency_service_id: str