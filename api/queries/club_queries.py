"""
Database Queries for Clubs
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional, List
from models.clubs import ClubResponse
from utils.exceptions import UserDatabaseException

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

pool = ConnectionPool(DATABASE_URL)


class ClubQueries:
    """
    Class containing queries for the Clubs table

    Can be dependency injected into a route like so

    def my_route(clubQueries: ClubQueries = Depends()):
        # Here you can call any of the functions to query the DB
    """

    def get_by_id(self, club_id) -> Optional[ClubResponse]:
        """
        Gets a club from the database by id

        Returns None if the club isn't found
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(ClubResponse)) as cur:
                    cur.execute(
                      """
                      SELECT
                      *
                      FROM clubs
                      WHERE club_id = %s
                      """,
                      [club_id],
                    )
                club = cur.fetchone()
                if not club:
                    return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting club with id: {club_id}")
        return club

    def create_club(self, owner_id: int, name: str, city: str, state: str, country: str):
        """
        Creates a new club in the database

        Raises a ClubInsertionException if creating the club fails (ADD LATER)
        """
        with pool.connection() as conn:
            with conn.cursor(row_factory=class_row(ClubResponse)) as cur:
                cur.execute(
                  """

                    INSERT INTO clubs (
                      owner_id, name, city, state, country
                    ) VALUES (
                      %s, %s, %s, %s, %s
                    )
                    RETURNING *;
                  """,
                  [
                    owner_id,
                    name,
                    city,
                    state,
                    country,
                  ],
                )
                club = cur.fetchone()

        return club

    def delete_club(self, club_id) -> bool:
        """
        Deletes club from the database
        """
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                  """
                    DELETE FROM clubs WHERE club_id = %s;

                  """,
                  [
                    club_id
                  ],
                )
            return True

    def list_clubs(self) -> Optional[List[ClubResponse]]:
        """
        Gets a club from the database by id

        Returns None if the club isn't found
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(ClubResponse)) as cur:
                    cur.execute(
                      """
                        SELECT
                          *
                        FROM clubs;

                      """,
                    )
                    clubs = cur.fetchall()
                    if not clubs:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f'{"Error getting clubs"}')
        return clubs

    def list_clubs_by_user(self, user_id: int) -> Optional[List[ClubResponse]]:
        """
        Lists all of the clubs the passed in user belongs to.
        The user id that's passed in is the id of the current logged in user.
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(ClubResponse)) as cur:
                    cur.execute(
                        """
                        SELECT c.*
                        FROM clubs c
                        INNER JOIN clubs_members cm ON c.club_id = cm.club_id
                        WHERE cm.member_id = %s;
                        """,
                        (user_id,)
                    )
                    clubs = cur.fetchall()
                    if not clubs:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting user's clubs: {e}")
        return clubs
