"""
Pydantic Models for Users.
"""
from pydantic import BaseModel
from typing import Optional


class UserRequest(BaseModel):
    """
    Represents a the parameters needed to create a new user
    """

    username: str
    password: str


class UserResponse(BaseModel):
    """
    Represents a user, with the password not included
    """

    id: int
    username: str


class UserWithPw(BaseModel):
    """
    Represents a user with password included
    """

    id: int
    username: str
    password: str
    email: str
    score: int
    picture_url: str


class UserIn(BaseModel):
    username: Optional[str]
    password: Optional[str]
    email: Optional[str]
    score: Optional[int]
    picture_url: Optional[str]


class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str]
    score: int
    picture_url: str


class UserNew(BaseModel):
    username: str
    password: str
    email: str
    score: int
    picture_url: str


class UserUpdate(BaseModel):
    username: str
    email: str
    score: int
    picture_url: str


class MemberRequest(BaseModel):
    """
    Represents the parameters to join a club

    """
    club_id: int
    member_id: int


class MemberResponse(BaseModel):
    """
    Represents a member of a club

    """
    club_id: int
    member_id: int
