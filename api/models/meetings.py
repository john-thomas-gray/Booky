"""
Pydantic Models for Meetings.
"""
from pydantic import BaseModel
from datetime import date
from typing import Optional


class MeetingRequest(BaseModel):
    """
    Represents a the parameters needed to create a new meeting
    """
    club_id: int
    book_title: str
    active: date


class MeetingResponse(BaseModel):
    """
    Represents a meeting
    """
    id: int
    club_id: int
    book_title: str
    active: date


class MeetingClubResponse(BaseModel):
    id: int
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
    attendee_page: int
    place_at_last_finish: int
    finished: bool


class AttendeeUpdate(BaseModel):
    meeting_id: int
    attendee_id: int
    attendee_page: Optional[int]
    place_at_last_finish: Optional[int]
    finished: Optional[bool]
