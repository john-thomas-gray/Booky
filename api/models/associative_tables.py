"""
Pydantic Models for Associative Tables.
"""
from pydantic import BaseModel


class ClubMembersResponse(BaseModel):
  club_id: int
  member_id: int

class ClubMeetingsResponse(BaseModel):
  club_id: int
  meeting_id: int

class MeetingsAttendeesResponse(BaseModel):
  meeting_id: int
  attendee_id: int
