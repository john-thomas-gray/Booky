"""
Pydantic Models for Meetings.
"""
from pydantic import BaseModel


class UserClubResponse(BaseModel):
    """
    Represents a meeting

    """
    id: int
    username: str
    club_id: int
    name: str
