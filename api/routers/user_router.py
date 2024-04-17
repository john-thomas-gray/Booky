"""
User API Router
"""

from fastapi import (
    Depends,
    Request,
    Response,
    HTTPException,
    status,
    APIRouter,
)
from queries.user_queries import (
  UserQueries,
)

from models.users import UserRequest, UserResponse, UserWithPw
from utils.exceptions import UserDatabaseException

router = APIRouter(tags=["Users"], prefix="/api/users")

@router.patch("/{username}")
async def update_user(
  username: str,
  updated_user: UserWithPw,
  queries: UserQueries = Depends(),
) -> UserWithPw:
  """
  Updates user information.
  """
  user = queries.get_by_username(username)
  if not user:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found",
    )
  updated_user_data = updated_user.dict(exclude_unset=True)
  updated_user_data["username"] = username
  updated_user = queries.update_user(**updated_user_data)

  if not updated_user:
      raise HTTPException(
          status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
          detail="Failed to update user",
      )

  return UserWithPw(**updated_user.dict())

@router.delete("/{username}")
async def delete_user(
    username: str,
    queries: UserQueries = Depends(),
):
    """
    Deletes user.
    """
    try:
        queries.delete_user(username)
    except UserDatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    return {"message": f"User {username} deleted successfully"}
