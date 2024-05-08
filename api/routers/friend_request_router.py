"""
Friend Request API Router
"""
from fastapi import (
    Depends,
    Response,
    APIRouter,
    HTTPException,
    status
)
from queries.friend_request_queries import (
  FriendRequestQueries
)

from models.users import UserResponse
from utils.exceptions import UserDatabaseException
from models.friend_request import FriendRequestRequest, FriendRequestResponse
from utils.authentication import try_get_jwt_user_data

router = APIRouter(tags=["Friends"], prefix="/api/friend")


@router.post('/request')
async def send_request(
    response: Response,
    friend_request: FriendRequestRequest,
    user: UserResponse = Depends(try_get_jwt_user_data),
    queries: FriendRequestQueries = Depends(),
) -> FriendRequestResponse:
    if friend_request.user_id == friend_request.friend_id:
        response.status_code = 500
    else:
        request = queries.send_request(user_id=friend_request.user_id, friend_id=user.id, friend_name=user.username)
        request_out = FriendRequestResponse(**request.model_dump())
        return request_out


@router.delete('/request/{user_id}/{friend_id}')
async def deny_request(
    user_id: int,
    friend_id: int,
    queries: FriendRequestQueries = Depends(),
):
    try:
        queries.deny_request(user_id, friend_id)
        return True

    except UserDatabaseException:
        return False


@router.get('/requests')
async def list_requests(
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
    queries: FriendRequestQueries = Depends()
):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not logged in"
        )

    else:
        requests = queries.list_requests()
        if requests is None:
            response.status_code = 404
        return requests
