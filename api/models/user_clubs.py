"""
Pydantic Models for Meetings.
"""
from pydantic import BaseModel
from typing import Optional

class UserClubRequest(BaseModel):
  """
  Represents a the parameters needed to create a new meeting
  """
  user_id: int
  club_id: int


class UserClubResponse(BaseModel):
  """
  Represents a meeting

  """
  id: int
  username: str
  club_id: int
