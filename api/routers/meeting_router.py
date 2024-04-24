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

# from utils.exceptions import ClubDatabaseException
from models.meetings import MeetingRequest, MeetingResponse, MeetingClubResponse
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
    request: Request,
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends(),
) -> MeetingResponse:
    """
    Creates a new meeting after form is filled out
    """

    if not user:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not logged in"
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
    queries: MeetingQueries = Depends(),
) -> List[MeetingClubResponse]:
    meetings = queries.list_meetings_by_club(club_id)
    if meetings is None:
        response.status_code = 404
    return meetings

@router.get("/")
def list_meetings(
    response: Response,
    queries: MeetingQueries = Depends(),
) -> List[MeetingResponse]:
    meetings = queries.list_meetings()
    if meetings is None:
        response.status_code = 404
    return meetings

@router.delete("/{id}")
def delete_meeting(
    id: int,
    response: Response,
    queries: MeetingQueries = Depends() ) -> bool:
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
    queries: MeetingQueries = Depends() ) -> MeetingClubResponse:
    meeting = queries.get_by_id(id)
    if meeting is None:
        response.status_code = 404
    return meeting
