"""
User API Router
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
from queries.user_queries import (
  UserQueries,
)
from utils.authentication import try_get_jwt_user_data
from models.users import UserResponse, UserWithPw, MemberResponse, UserOut, UserUpdate
from utils.exceptions import UserDatabaseException

router = APIRouter(tags=["Users"], prefix="/api/users")


@router.get("/{id}")
async def get_user(
  id: int,
  response: Response,
  queries: UserQueries = Depends(),
):
    """
    Gets user information
    """
    user = queries.get_by_id(id)
    if user is None:
        response.status_code = 404
    return user


@router.get("/")
async def list_users(
    response: Response,
    queries: UserQueries = Depends(),
) -> List[UserOut]:
    users = queries.list_users()
    if users is None:
        response.status_code = 404
    return users


@router.post("/")
async def create_user(
  new_user: UserWithPw,
  request: Request,
  response: Response,
  queries: UserQueries = Depends(),
) -> UserWithPw:
    user = queries.create_user(new_user.username, new_user.password, new_user.email, new_user.score, new_user.picture_url)
    user_out = UserWithPw(**user.model_dump())
    return user_out


@router.patch("/{user_id}")
def update_user(
    response: Response,
    user_id: int,
    user: UserUpdate,
    queries: UserQueries = Depends(),
) -> UserUpdate:

    updated_user = queries.update_user(
        user.username,
        user.email,
        user.score,
        user.picture_url,
        user_id=user_id
    )
    return updated_user


@router.delete("/{username}")
async def delete_user(
    username: str,
    queries: UserQueries = Depends(),
):
    """
    Deletes user.
    """
    try:
        queries.delete_user(username)
    except UserDatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    return {"message": f"User {username} deleted successfully"}


@router.get("/club/{club_id}")
async def list_club_members(
    club_id: int,
    response: Response,
    queries: UserQueries = Depends(),
) -> List[UserResponse]:
    club_members = queries.list_club_members(club_id)
    if club_members is None:
        response.status_code = 404
    return club_members


@router.post("/club/{club_id}")
async def join_club(
    club_id: int,
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
    queries: UserQueries = Depends(),
) -> MemberResponse:
    club_members = queries.join_club(club_id=club_id, member_id=user.id)
    club_member_out = MemberResponse(**club_members.model_dump())
    # if club_members is None:
    #   response.status_code = 404
    return club_member_out
