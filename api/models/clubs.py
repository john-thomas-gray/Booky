"""
Pydantic Models for Clubs.
"""
from pydantic import BaseModel


class ClubRequest(BaseModel):
  """
  Represents a the parameters needed to create a new club
  """

  name: str
  city: str
  state: str
  country: str

class ClubResponse(BaseModel):
  """
  Represents a club
  """
  id: int
  name: str
  city: str
  state: str
  country: str


class ClubDelete(BaseModel):
  """
  Represents a club to delete
  """
  id: int

class ClubDeleteResponse(BaseModel):
  """
  Represents a deleted club

  """
  id: int
