"""
meeting API Router
"""

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

# from utils.exceptions import ClubDatabaseException
from models.meetings import MeetingRequest, MeetingResponse

from utils.authentication import (
    try_get_jwt_user_data,
    hash_password,
    generate_jwt,
    verify_password,
)

# Note we are using a prefix here,
# This saves us typing in all the routes below
router = APIRouter(tags=["Authentication"], prefix="/api/auth")

@router.post("/meeting")
async def create_meeting(
    new_meeting: MeetingRequest,
    request: Request,
    response: Response,
    queries: MeetingQueries = Depends(),
) -> MeetingResponse:
    """
    Creates a new meeting after form is filled out
    """


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
