"""
Pydantic Models for Clubs.
"""
from pydantic import BaseModel


class ClubRequest(BaseModel):
  """
  Represents a the parameters needed to create a new club
  """
  owner_id: int
  name: str
  city: str
  state: str
  country: str

class ClubResponse(BaseModel):
  """
  Represents a club
  """
  owner_id: int
  club_id: int
  name: str
  city: str
  state: str
  country: str


class ClubDelete(BaseModel):
  """
  Represents a club to delete
  """
  club_id: int

class ClubDeleteResponse(BaseModel):
  """
  Represents a deleted club

  """
  club_id: int
