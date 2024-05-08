"""
Pydantic Models for Friend Requests.
"""
from pydantic import BaseModel


class FriendRequestRequest(BaseModel):
    """
    Represents a the parameters needed to create a friend request
    """
    user_id: int
    friend_id: int
    friend_name: str


class FriendRequestResponse(BaseModel):
    """
    Represents a the parameters needed to create a friend request
    """
    user_id: int
    friend_id: int
    friend_name: str
    approved: bool
