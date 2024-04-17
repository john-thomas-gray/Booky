"""
Pydantic Models for Meetings.
"""
from pydantic import BaseModel
from datetime import datetime


class MeetingRequest(BaseModel):
  """
  Represents a the parameters needed to create a new meeting
  """
  club_id: int
  club_name: str
  club_score: int
  book_title: str
  total_pages: int
  current_page: int
  active: datetime

class MeetingResponse(BaseModel):
  """
  Represents a meeting
  """

  club_id: int
  club_name: str
  club_score: int
  book_title: str
  total_pages: int
  current_page: int
  active: datetime
