from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class MessageModel(BaseModel):
    message: str
    sender: str
    receiver: str
    quotation_id: Optional[str] = None

class MessageResponse(BaseModel):
    message: str
    sender: str
    timestamp: str

class ChatHistoryResponse(BaseModel):
    messages: List[MessageResponse]
