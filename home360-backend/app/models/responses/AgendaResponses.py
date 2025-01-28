from pydantic import BaseModel


class HoursAgendaResponse(BaseModel):
    day_of_week: int
    start_time: float
    finish_time: float


class AgendaResponse(BaseModel):
    working_days: list[int]
    working_hours: list[HoursAgendaResponse]
    appointments: list[int]

    def __init__(self, **data) -> None:
        parsed_data = {}
        if data.get("agenda") and data["agenda"].get("working_days") == None:
            parsed_data["working_days"] = list(data["agenda"].keys())
            parsed_data["working_hours"] = []
            for day_of_week in data["agenda"]:
                parsed_data["working_hours"].append(
                    HoursAgendaResponse(
                        **{
                            "day_of_week": day_of_week,
                            "start_time": data["agenda"][day_of_week]["start"],
                            "finish_time": data["agenda"][day_of_week]["finish"],
                        }
                    )
                )
        elif data.get("agenda"):
            data = data["agenda"]

        super().__init__(**{**parsed_data, **data})
