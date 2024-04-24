"""
Club API Router
"""
from typing import List
from fastapi import (
    Depends,
    Request,
    Response,
    HTTPException,
    status,
    APIRouter,
)
from queries.club_queries import (
  ClubQueries,
)

from models.users import UserResponse
# from utils.exceptions import ClubDatabaseException
from models.clubs import ClubRequest, ClubResponse
from utils.authentication import try_get_jwt_user_data
# Note we are using a prefix here,
# This saves us typing in all the routes below
router = APIRouter(tags=["Clubs"], prefix="/api")

@router.post("/clubs")
async def create_club(
    new_club: ClubRequest,
    request: Request,
    response: Response,
    queries: ClubQueries = Depends(),
) -> ClubResponse:
    """
    Creates a new club when someone submits the signup form
    """
    club = queries.create_club(new_club.owner_id,new_club.name, new_club.city, new_club.state, new_club.country)
    club_out = ClubResponse(**club.model_dump())

    return club_out




@router.get("/clubs/{club_id}")
def get_club(
    club_id: int,
    response: Response,
    queries: ClubQueries = Depends()
) -> ClubResponse:
    club = queries.get_by_id(club_id)
    if club is None:
        response.status_code = 404
    print(club)
    return club


@router.delete("/clubs/{club_id}")
async def delete_club(
    club_id: int,
    queries: ClubQueries = Depends(),) -> bool:


    try:

        queries.delete_club(club_id)
        return True


    except:
        return False

@router.get("/clubs")
def list_clubs(
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
    queries: ClubQueries = Depends()):


    if not user:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not logged in"
        )

    else:
        clubs = queries.list_clubs()
        if clubs is None:
            response.status_code = 404
        return clubs
