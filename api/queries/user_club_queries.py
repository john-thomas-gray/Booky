"""
Database Queries for Clubs
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional, List
from models.user_clubs import UserClubResponse


DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
  raise ValueError("DATABASE_URL environment variable is not set")

pool = ConnectionPool(DATABASE_URL)




class UserClubQueries:

  def clubs_by_owner_id(self, owner_id: int) -> Optional[List[UserClubResponse]]:
    """
    Creates a new club in the database

    Raises a ClubInsertionException if creating the club fails (ADD LATER)
    """
    with pool.connection() as conn:
      with conn.cursor(row_factory=class_row(UserClubResponse)) as cur:
        cur.execute(
          """




        SELECT users.id, users.username, clubs.club_id, clubs.name
        FROM clubs
        left join
        users on users.id = clubs.owner_id

        WHERE users.id = %s;

          """,
          [
            owner_id,

          ],
        )
        userclub = cur.fetchall()

    return userclub


  def list_userclubs(self) -> Optional[List[UserClubResponse]]:
    """
    Lists users by username and their associated club id's

    Raises a ClubInsertionException if creating the club fails (ADD LATER)
    """
    with pool.connection() as conn:
      with conn.cursor(row_factory=class_row(UserClubResponse)) as cur:
        cur.execute(
        """
        SELECT users.id, users.username, clubs.club_id, clubs.name
        FROM clubs
        left join
        users on users.id = clubs.owner_id
        ORDER BY users.username;
        """,
        )
        userclub = cur.fetchall()

    return userclub
