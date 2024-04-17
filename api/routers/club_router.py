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
from models.clubs import ClubRequest, ClubResponse, ClubDelete, ClubDeleteResponse

# Note we are using a prefix here,
# This saves us typing in all the routes below
router = APIRouter(tags=["Clubs"], prefix="/api")

@router.post("/clubs")
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




@router.get("/clubs/{id}")
def get_club(
    id: int,
    response: Response,
    queries: ClubQueries = Depends()
) -> ClubResponse:
    club = queries.get_by_id(id)
    if club is None:
        response.status_code = 404
    print(club)
    return club


@router.delete("/clubs/{id}")
async def delete_club(
    id: int,
    queries: ClubQueries = Depends(),) -> bool:


    try:

        queries.delete_club(id)
        return True


    except:
        return False
