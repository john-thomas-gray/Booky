"""
Pydantic Models for Meetings.
"""
from pydantic import BaseModel
from typing import Optional


class UserClubResponse(BaseModel):
  """
  Represents a meeting

  """
  id: int
  username: str
  club_id: int
  name: str
