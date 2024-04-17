"""
Club API Router
"""

from fastapi import (
    Depends,
    Request,
    Response,
    HTTPException,
    status,
    APIRouter,
)
from queries.club_queries import (
  ClubQueries,
)

# from utils.exceptions import ClubDatabaseException
from models.clubs import ClubRequest, ClubResponse

from utils.authentication import (
    try_get_jwt_user_data,
    hash_password,
    generate_jwt,
    verify_password,
)

# Note we are using a prefix here,
# This saves us typing in all the routes below
router = APIRouter(tags=["Authentication"], prefix="/api/auth")

@router.post("/club")
async def create_club(
    new_club: ClubRequest,
    request: Request,
    response: Response,
    queries: ClubQueries = Depends(),
) -> ClubResponse:
    """
    Creates a new club when someone submits the signup form
    """
    # Hash the password the club sent us
    # hashed_password = hash_password(new_club.password)

    # Create the club in the database
    club = queries.create_club(new_club.name, new_club.city, new_club.state, new_club.country)
    # try:
    #     club = queries.create_club(new_club.club, hashed_password)
    # except ClubDatabaseException as e:
    #     print(e)
    #     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    # Generate a JWT token
    # token = generate_jwt(club)

    # Convert the ClubWithPW to a ClubOut
    club_out = ClubResponse(**club.model_dump())

    # Secure cookies only if running on something besides localhost
    # secure = True if request.headers.get("origin") == "localhost" else False

    # Set a cookie with the token in it
    # response.set_cookie(
    #     key="fast_api_token",
    #     value=token,
    #     httponly=True,
    #     samesite="lax",
    #     secure=secure,
    # )
    return club_out
