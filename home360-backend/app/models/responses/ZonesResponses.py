from pydantic import BaseModel
from typing import Union


class GetZonesResponse(BaseModel):
    zones: list[Union[str, None]]


class GetZoneError(BaseModel):
    detail: str

class UpdateZonesResponse(BaseModel):
    zones: list[Union[str, None]]


class UpdateZonesError(BaseModel):
    detail: str
