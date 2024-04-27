"""
Pydantic Models for Meetings.
"""
from pydantic import BaseModel
from datetime import date


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
  active: date

class MeetingResponse(BaseModel):
  """
  Represents a meeting
  """
  id : int
  club_id: int
  club_name: str
  club_score: int
  book_title: str
  total_pages: int
  current_page: int
  active: date

class MeetingClubResponse(BaseModel):
  active: date
  book_title: str

class MeetingAttendeeResponse(BaseModel):
  meeting_id: int
  attendee_id: int

class AttendeeRequest(BaseModel):
  meeting_id: int
  attendee_id: int


class AttendeeResponse(BaseModel):
  meeting_id: int
  attendee_id: int
  username: str
