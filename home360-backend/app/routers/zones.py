from fastapi import APIRouter, status, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.models.entities.Auth import Auth
from app.models.entities.Zone import Zone

from app.models.responses.ZonesResponses import (
    GetZonesResponse,
    GetZoneError,
    UpdateZonesResponse,
    UpdateZonesError,
)

router = APIRouter(
    prefix="/zones",
    tags=["Zones"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=GetZonesResponse,
    responses={
        500: {"model": GetZoneError},
    },
)
def get_all_zones():
    """
    Get all zones.

    This will allow authenticated users to retrieve all zones.

    This path operation will:

    * Return all the zones in the system.
    * Throw an error if zone retrieving fails.
    """
    try:
        zones = Zone.get_all()
        return {"zones": zones}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.post(
    "/add/{zone_name}",
    status_code=status.HTTP_200_OK,
    response_model=UpdateZonesResponse,
    responses={
        400: {"model": UpdateZonesError},
        401: {"model": UpdateZonesError},
        403: {"model": UpdateZonesError},
        500: {"model": UpdateZonesError},
    },
)
def add_zone(
    zone_name: str
):
    """
    Add a new zone.

    This will allow authenticated admins to add new zones.

    This path operation will:

    * Add the new zone.
    * Return the updated list of zones.
    * Throw an error if it fails.
    """
    try:
        Zone.add_zone(zone_name)
        updated_zones = Zone.get_all()
        return {"zones": updated_zones}
    except HTTPException as http_exception:
        return JSONResponse(
            status_code=http_exception.status_code,
            content={"detail": http_exception.detail},
        )
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.delete(
    "/delete/{zone_name}",
    status_code=status.HTTP_200_OK,
    response_model=UpdateZonesResponse,
    responses={
        401: {"model": UpdateZonesError},
        403: {"model": UpdateZonesError},
        500: {"model": UpdateZonesError},
    },
)
def delete_zone(
    zone_name: str
):
    """
    Deletes a zone.

    This will allow authenticated admins to delete zones.

    This path operation will:

    * Delete the zone.
    * Return the updated list of zones.
    * Throw an error if it fails.
    """
    try:
        Zone.delete_zone(zone_name)
        updated_zones = Zone.get_all()
        return {"zones": updated_zones}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
