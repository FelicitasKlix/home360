from pydantic import BaseModel
from typing import Union


class SuccessfullLoadScoreResponse(BaseModel):
    message: str


class ScoreErrorResponse(BaseModel):
    detail: str


class BasicScoreResponse(BaseModel):
    puntuality: Union[float, str, None] = None
    communication: Union[float, str, None] = None
    attendance: Union[float, str, None] = None
    treat: Union[float, str, None] = None
    cleanliness: Union[float, str, None] = None
    availability: Union[float, str, None] = None
    price: Union[float, str, None] = None
    attention: Union[float, str, None] = None


class SuccessfullScoreResponse(BaseModel):
    score_metrics: BasicScoreResponse


class PendingScoresErrorResponse(BaseModel):
    detail: str


class PendingScoresResponse(BaseModel):
    pending_scores: list
