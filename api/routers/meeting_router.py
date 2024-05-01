"""
meeting API Router
"""
from typing import List

from fastapi import (
    Depends,
    Response,
    HTTPException,
    status,
    APIRouter,
)
from queries.meeting_queries import (
  MeetingQueries,
)
from models.users import UserResponse, UserOut

# from utils.exceptions import ClubDatabaseException
from models.meetings import MeetingRequest, MeetingResponse, MeetingClubResponse, AttendeeResponse, AttendeePageUpdate
from utils.authentication import (
    try_get_jwt_user_data,
)

# Note we are using a prefix here,
# This saves us typing in all the routes below
router = APIRouter(tags=["Meeting"], prefix="/api/meeting")


@router.post("/create")
def create_meeting(
    new_meeting: MeetingRequest,
    user: UserResponse = Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends(),
) -> MeetingResponse:
    """
    Creates a new meeting after form is filled out
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="not logged in fool"
        )
    else:
        # Create the meeting in the database
        meeting = queries.create_meeting(
            new_meeting.club_id,
            new_meeting.book_title,
            new_meeting.active
            )
        meeting_out = MeetingResponse(**meeting.model_dump())
        return meeting_out


@router.get("/")
def list_meetings(
    response: Response,
    # user: UserResponse=Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends(),
) -> List[MeetingResponse]:
    meetings = queries.list_meetings()
    if meetings is None:
        response.status_code = 404
    return meetings


@router.get("/club/{club_id}")
def list_meetings_by_club(
    club_id: int,
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends(),
) -> List[MeetingClubResponse]:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="not logged in fool"
        )
    else:
        meetings = queries.list_meetings_by_club(club_id)
        if meetings is None:
            response.status_code = 404
        return meetings


@router.delete("/{id}")
def delete_meeting(
    id: int,
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
        queries: MeetingQueries = Depends()) -> bool:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="not logged in fool"
        )
    else:
        try:
            queries.delete_meeting(id)
            print("success!")
            return True
        except Exception as e:
            print(e)
            print("could NOT delete meeting")
            return False


@router.get("/{id}")
def get_meeting_details(
    id: int,
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
        queries: MeetingQueries = Depends()) -> MeetingResponse:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="not logged in fool"
        )
    else:
        meeting = queries.get_by_id(id)
        if meeting is None:
            response.status_code = 404
        return meeting


@router.get("/{id}/attendees")
def list_attendees_by_meeting(
    id: int,
    response: Response,
    user: UserOut = Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends(),
) -> List[UserOut]:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="not logged in fool"
        )
    else:
        meetings = queries.list_attendees_by_meeting(id)
        if meetings is None:
            response.status_code = 404
        return meetings


@router.post("/{meeting_id}")
async def join_meeting(
    meeting_id: int,
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends(),
) -> AttendeeResponse:
    attendee = queries.join_meeting(meeting_id=meeting_id, attendee_id=user.id)
    attendee_out = AttendeeResponse(**attendee.model_dump())
    return attendee_out


@router.get("/{user_id}/user")
def list_meetings_by_user(
    user_id: int,
    response: Response,
    user: MeetingResponse = Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends(),
) -> List[MeetingResponse]:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="not logged in fool"
        )
    else:
        meetings = queries.list_meetings_by_user(user_id)
        if meetings is None:
            response.status_code = 404
        return meetings


@router.delete("/{meeting_id}/leave")
async def leave_meeting(
    meeting_id: int,
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
        queries: MeetingQueries = Depends()) -> bool:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="not logged in fool"
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
def update_attendee_page(
    response: Response,
    attendee_page: AttendeePageUpdate,
    queries: MeetingQueries = Depends(),
) -> AttendeePageUpdate:
    updated_page = queries.update_attendee_page(
        attendee_page.attendee_page,
        attendee_page.meeting_id,
        attendee_page.attendee_id
    )
    return updated_page


@router.get("/page/{meeting_id}/{attendee_id}")
def get_attendee(
    response: Response,
    meeting_id: int,
    attendee_id: int,
    queries: MeetingQueries = Depends(),
) -> AttendeeResponse:
    attendee_response = queries.get_attendee(
        meeting_id,
        attendee_id
    )
    return attendee_response
