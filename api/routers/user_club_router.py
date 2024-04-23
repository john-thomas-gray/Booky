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
from queries.user_club_queries import (
  UserClubQueries,
)


from models.user_clubs import UserClubResponse, UserClubRequest



router = APIRouter(tags=["User Clubs"], prefix="/api")




@router.post("/users/clubs")
async def create_user_club(
    new_club: UserClubRequest,
    request: Request,
    response: Response,
    queries: UserClubQueries = Depends(),
) -> UserClubResponse:
    """
    Creates a new club when someone submits the signup form
    """
    club = queries.create_club(new_club.user_id, new_club.club_id)
    club_out = UserClubResponse(**club.model_dump())

    return club_out


@router.get("/users/clubs/{owner_id}")
async def list_user_clubs_by_id(
    owner_id: int,
    response: Response,
    queries: UserClubQueries = Depends(), ) -> List[UserClubResponse]:

    clubs = queries.clubs_by_owner_id(owner_id)

    return clubs


@router.get("/users/clubs/")
async def list_user_clubs(
    response: Response,
    queries: UserClubQueries = Depends(), ) -> List[UserClubResponse]:

    clubs = queries.list_userclubs()

    return clubs
