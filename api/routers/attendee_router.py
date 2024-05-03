"""
Attendee API Router
"""
from typing import List

from fastapi import (
    Depends,
    Response,
    HTTPException,
    status,
    APIRouter,
)
from queries.attendee_queries import (
  AttendeeQueries,
)
from models.users import UserResponse

# from utils.exceptions import ClubDatabaseException
from models.attendees import AttendeeResponse, AttendeeUpdate
from utils.authentication import (
    try_get_jwt_user_data,
)

# Note we are using a prefix here,
# This saves us typing in all the routes below
router = APIRouter(tags=["Attendees"], prefix="/api/attendees")


@router.get("/{meeting_id}/attendees")
def list_attendees_by_meeting(
    meeting_id: int,
    response: Response,
    user: AttendeeResponse = Depends(try_get_jwt_user_data),
    queries: AttendeeQueries = Depends(),
) -> List[AttendeeResponse]:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="UserResponse is null"
        )
    else:
        attendees = queries.list_attendees_by_meeting(meeting_id)
        if attendees is None:
            response.status_code = 404
        return attendees


@router.post("/{meeting_id}")
async def join_meeting(
    meeting_id: int,
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
    queries: AttendeeQueries = Depends(),
) -> AttendeeResponse:
    attendee = queries.join_meeting(meeting_id=meeting_id, attendee_id=user.id)
    attendee_out = AttendeeResponse(**attendee.model_dump())
    return attendee_out


@router.delete("/{meeting_id}/leave")
async def leave_meeting(
    meeting_id: int,
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
        queries: AttendeeQueries = Depends()) -> bool:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="UserResponse is null"
        )
    else:
        try:
            queries.leave_meeting(meeting_id=meeting_id, attendee_id=user.id)
            print("meeting_id", meeting_id)

            print("success! you left the meeting")
            return True
        except Exception as e:
            print(e)
            print("could NOT leave meeting")
            return False


@router.patch("/page")
def update_attendee(
    attendee: AttendeeUpdate,
    queries: AttendeeQueries = Depends(),
) -> AttendeeUpdate:
    updated_attendee = queries.update_attendee(
        attendee.attendee_page,
        attendee.meeting_id,
        attendee.attendee_id,
        attendee.place_at_last_finish,
        attendee.finished
    )
    return updated_attendee


@router.get("/page/{meeting_id}/{attendee_id}")
def get_attendee(
    meeting_id: int,
    attendee_id: int,
    queries: AttendeeQueries = Depends(),
) -> AttendeeResponse:
    attendee_response = queries.get_attendee(
        meeting_id,
        attendee_id
    )
    return attendee_response
