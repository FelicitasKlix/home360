from pydantic import BaseModel


class PatientResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
