"""
Pydantic Models for Attendees.
"""
from pydantic import BaseModel
from typing import Optional


class AttendeeRequest(BaseModel):
    meeting_id: int
    attendee_id: int


class AttendeeResponse(BaseModel):
    meeting_id: Optional[int]
    attendee_id: Optional[int]
    attendee_page: Optional[int]
    place_at_last_finish: Optional[int]
    finished: Optional[bool]


class AttendeeUpdate(BaseModel):
    meeting_id: Optional[int]
    attendee_id: Optional[int]
    attendee_page: Optional[int]
    place_at_last_finish: Optional[int]
    finished: Optional[bool]
