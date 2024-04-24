"""
User Authentication API Router
"""
from fastapi import (
    Depends,
    HTTPException,
    APIRouter,
)
from queries.club_queries import (
    ClubQueries,
)
from typing import Optional
from utils.exceptions import UserDatabaseException
from models.users import UserRequest, UserResponse, UserWithPw, UserSigninRequest, UserSigninResponse
from models.associative_tables import ClubMembersResponse

from utils.authentication import (
    try_get_jwt_user_data,
    hash_password,
    generate_jwt,
    verify_password,
)

# Note we are using a prefix here,
# This saves us typing in all the routes below
router = APIRouter(tags=["Associations"], prefix="/api/assoc")

@router.post("/joinclub", response_model=Optional[ClubMembersResponse])
def join_club(new_pair:):
    """
    Endpoint to join a user to a club.
    """
    try:
        club_member_pair = db.join_club(user_id, club_id)
        if not club_member_pair:
            raise HTTPException(status_code=404, detail="Club or user not found")
        return club_member_pair
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")
