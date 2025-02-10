from pydantic import BaseModel

class Message(BaseModel):
    message: str
    sender: str
    receiver: str
    quotation_id: str