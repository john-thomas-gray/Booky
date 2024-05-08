"""
Friend Request API Router
"""
# from utils.exceptions import UserDatabaseException
# from fastapi import (
#     Depends,
#     Response,
#     APIRouter,
# )
# from queries.friend_request_queries import (
#   FriendRequestQueries
# )

# from models.users import UserResponse
# # from utils.exceptions import ClubDatabaseException
# from models.friend_request import FriendRequestRequest, FriendRequestResponse
# from utils.authentication import try_get_jwt_user_data
# Note we are using a prefix here,
# This saves us typing in all the routes below
# router = APIRouter(tags=["Friends"], prefix="/api/friend/")


# @router.post('/request')
# async def send_request(
#     response: Response,
#     friend_request: FriendRequestRequest,
#     user: UserResponse = Depends(try_get_jwt_user_data),
#     queries: FriendRequestQueries = Depends(),
# ) -> FriendRequestResponse:
#     if friend_request.user_id == friend_request.friend_id:
#         response.status_code = 500
#     else:
#         request = queries.send_request(user_id=friend_request.user_id, friend_id=user.id, friend_name=user.username)
#         request_out = FriendRequestResponse(**request.model_dump)
