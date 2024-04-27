"""
meeting API Router
"""
from typing import List;

from fastapi import (
    Depends,
    Request,
    Response,
    HTTPException,
    status,
    APIRouter,
)
from queries.meeting_queries import (
  MeetingQueries,
)
from typing import Optional, List

from models.users import UserResponse

# from utils.exceptions import ClubDatabaseException
from models.meetings import MeetingRequest, MeetingResponse, MeetingClubResponse, MeetingAttendeeResponse, AttendeeResponse
from models.users import UserResponse
from utils.authentication import (
    try_get_jwt_user_data,
    hash_password,
    generate_jwt,
    verify_password,
)

# Note we are using a prefix here,
# This saves us typing in all the routes below
router = APIRouter(tags=["Meeting"], prefix="/api/meeting")

@router.post("/create")
def create_meeting(
    new_meeting: MeetingRequest,
    user: UserResponse=Depends(try_get_jwt_user_data),
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
        # Create the club in the database
        meeting = queries.create_meeting(
            new_meeting.club_id,
            new_meeting.club_name,
            new_meeting.club_score,
            new_meeting.book_title,
            new_meeting.total_pages,
            new_meeting.current_page,
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
#   if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="not logged in fool"
#         )
#   else:
    meetings = queries.list_meetings()
    if meetings is None:
        response.status_code = 404
    return meetings

@router.get("/club/{club_id}")
def list_meetings_by_club(
    club_id: int,
    response: Response,
    user: UserResponse=Depends(try_get_jwt_user_data),
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
    user: UserResponse=Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends() ) -> bool:
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
def get_meeting(
    id: int,
    response: Response,
    user: UserResponse=Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends() ) -> MeetingClubResponse:
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
    user: AttendeeResponse=Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends(),
) -> List[AttendeeResponse]:
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
    attendee = queries.join_meeting(meeting_id = meeting_id, attendee_id = user.id)
    attendee_out = AttendeeResponse(**attendee.model_dump())
    return attendee_out
