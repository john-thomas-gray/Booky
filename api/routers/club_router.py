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

# from utils.exceptions import ClubDatabaseException
from models.clubs import ClubRequest, ClubResponse, ClubDelete, ClubDeleteResponse

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
    club = queries.create_club(new_club.name, new_club.city, new_club.state, new_club.country)
    club_out = ClubResponse(**club.model_dump())

    return club_out




@router.get("/clubs/{id}")
def get_club(
    id: int,
    response: Response,
    queries: ClubQueries = Depends()
) -> ClubResponse:
    club = queries.get_by_id(id)
    if club is None:
        response.status_code = 404
    print(club)
    return club


@router.delete("/clubs/{id}")
async def delete_club(
    id: int,
    queries: ClubQueries = Depends(),) -> bool:


    try:

        queries.delete_club(id)
        return True


    except:
        return False

@router.get("/clubs")
def list_clubs(
    response: Response,
    queries: ClubQueries = Depends(),
) -> List[ClubResponse]:
    clubs = queries.list_clubs()
    if clubs is None:
        response.status_code = 404
    return clubs
