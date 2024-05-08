"""
Friend API Router
"""
from utils.exceptions import UserDatabaseException
from fastapi import (
    Depends,
    Response,
    APIRouter,
)
from queries.friend_queries import (
  FriendQueries
)

from models.users import UserResponse
# from utils.exceptions import ClubDatabaseException
from models.friends import FriendRequest, FriendResponse
from utils.authentication import try_get_jwt_user_data
# Note we are using a prefix here,
# This saves us typing in all the routes below
router = APIRouter(tags=["Friends"], prefix="/api")


@router.post('/friend')
async def add_friend(
    response: Response,
    friend_request: FriendRequest,
    user: UserResponse = Depends(try_get_jwt_user_data),
    queries: FriendQueries = Depends(),
) -> FriendResponse:
    if friend_request.member_id == friend_request.friend_id:
        response.status_code = 500
    else:
        friend = queries.add_friend(member_id=friend_request.member_id, friend_id=friend_request.friend_id)
        friend_out = FriendResponse(**friend.model_dump())
        return friend_out


@router.get('/friends')
async def get_friends(

    response: Response,
    queries: FriendQueries = Depends(),
):

    friends = queries.list_friends()
    if friends is None:
        response.status_code = 404
    return friends


@router.get('/{member_id}/friends')
async def get_friends_by_id(
    member_id: int,
    response: Response,
    queries: FriendQueries = Depends(),
):

    friends = queries.list_friends_by_id(member_id)
    if friends is None:
        response.status_code = 404
    return friends


@router.delete('/friend/{member_id}/{friend_id}')
async def remove_friend(
    member_id: int,
    friend_id: int,
    queries: FriendQueries = Depends(),
) -> bool:

    try:
        queries.remove_friend(member_id, friend_id)
        return True

    except UserDatabaseException:
        return False
