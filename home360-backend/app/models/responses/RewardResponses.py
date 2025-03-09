from enum import Enum
from pydantic import BaseModel


class SuccessfulRewardsResponse(BaseModel):
    amount: float


class RewardsErrorResponse(BaseModel):
    detail: str