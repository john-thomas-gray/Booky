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
from models.meetings import MeetingRequest, MeetingResponse, MeetingClubResponse
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
            status_code=status.HTTP_404_NOT_FOUND, detail="UserResponse is null"
        )
    else:
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
            status_code=status.HTTP_404_NOT_FOUND, detail="UserResponse is null"
        )
    else:
        meetings = queries.list_meetings_by_club(club_id)
        if meetings is None:
            response.status_code = 404
        return meetings


@router.delete("/{id}")
def delete_meeting(
    id: int,
    user: UserResponse = Depends(try_get_jwt_user_data),
        queries: MeetingQueries = Depends()) -> bool:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="UserResponse is null"
        )
    else:
        try:
            queries.delete_meeting(id)
            return True
        except Exception as e:
            print(e)
            return False


@router.get("/{id}")
def get_meeting_details(
    id: int,
    response: Response,
    user: UserResponse = Depends(try_get_jwt_user_data),
        queries: MeetingQueries = Depends()) -> MeetingResponse:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="UserResponse is null"
        )
    else:
        meeting = queries.get_by_id(id)
        if meeting is None:
            response.status_code = 404
        return meeting


@router.get("/{id}/users")
def list_users_by_meeting(
    id: int,
    response: Response,
    user: UserOut = Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends(),
) -> List[UserOut]:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="UserResponse is null"
        )
    else:
        users = queries.list_users_by_meeting(id)
        if users is None:
            response.status_code = 404
        return users


@router.get("/{user_id}/user")
def list_meetings_by_user(
    user_id: int,
    response: Response,
    user: MeetingResponse = Depends(try_get_jwt_user_data),
    queries: MeetingQueries = Depends(),
) -> List[MeetingResponse]:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="UserResponse is null"
        )
    else:
        meetings = queries.list_meetings_by_user(user_id)
        if meetings is None:
            response.status_code = 404
        return meetings
