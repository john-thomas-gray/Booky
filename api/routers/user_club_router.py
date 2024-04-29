"""
Club API Router
"""
from typing import List
from fastapi import (
    Depends,
    Response,
    APIRouter,
)
from queries.user_club_queries import (
  UserClubQueries,
)


from models.user_clubs import UserClubResponse


router = APIRouter(tags=["User Clubs"], prefix="/api")


@router.get("/users/clubs/{owner_id}")
async def list_user_clubs_by_id(
    owner_id: int,
    response: Response,
        queries: UserClubQueries = Depends(), ) -> List[UserClubResponse]:
    """
    List clubs by owner id
    """

    clubs = queries.clubs_by_owner_id(owner_id)

    return clubs


@router.get("/users/clubs/")
async def list_user_clubs(
    response: Response,
        queries: UserClubQueries = Depends(), ) -> List[UserClubResponse]:
    """
    List all user to club owner associations
    """

    clubs = queries.list_userclubs()

    return clubs
