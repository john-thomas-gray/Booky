"""
Pydantic Models for Friends.
"""
from pydantic import BaseModel


class FriendRequest(BaseModel):
    """
    Represents a the parameters needed to add a friend
    """
    member_id: int
    friend_id: int


class FriendResponse(BaseModel):
    """
    Represents a relationship
    """
    member_id: int
    friend_id: int


class FriendsResponse(BaseModel):
    username: str
    friend_id: int
    friend_username: str
