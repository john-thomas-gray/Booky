"""
Database Queries for Users
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional, List
from models.users import UserWithPw, UserOut, UserIn, MemberResponse
from utils.exceptions import UserDatabaseException

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

pool = ConnectionPool(DATABASE_URL)


class UserQueries:
    """
    Class containing queries for the Users table

    Can be dependency injected into a route like so

    def my_route(userQueries: UserQueries = Depends()):
        # Here you can call any of the functions to query the DB
    """

    def get_by_username(self, username: str) -> Optional[UserWithPw]:
        """
        Gets a user from the database by username

        Returns None if the user isn't found
        """

        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(UserWithPw)) as cur:
                    cur.execute(
                        """
                            SELECT
                                *
                            FROM users
                            WHERE username = %s
                            """,
                        [username],
                    )
                    user = cur.fetchone()
                    if not user:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting user {username}")
        return user

    def get_by_id(self, id: int) -> Optional[UserOut]:
        """
        Gets a user from the database by user id

        Returns None if the user isn't found
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(UserOut)) as cur:
                    cur.execute(
                        """
                            SELECT
                                *
                            FROM users
                            WHERE id = %s
                            """,
                        [id],
                    )
                    user = cur.fetchone()
                    if not user:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting user with id {id}")

        return user

    def list_users(self) -> Optional[List[UserOut]]:
        """
        Get list of all users
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(UserOut)) as cur:
                    cur.execute(
                        """
                            SELECT
                                *
                            FROM users
                            """,
                    )
                    users = cur.fetchall()
                    if not users:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f'{"Error getting users"}')
        return users

    def create_user(
            self,
            username: str,
            password: str,
            email: Optional[str] = None,
            score: Optional[str] = 0,
            picture_url: Optional[str] = 'https://files.slack.com/files-pri/T068GF0EERK-F06T5UESNNS/image.png'
            ) -> UserWithPw:
        """
        Creates a new user in the database

        Raises a UserInsertionException if creating the user fails
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(UserWithPw)) as cur:
                    cur.execute(
                        """
                        INSERT INTO users (
                            username,
                            password,
                            email,
                            score,
                            picture_url
                        ) VALUES (
                            %s, %s, %s, %s, %s
                        )
                        RETURNING *;
                        """,
                        [
                            username,
                            password,
                            email,
                            score,
                            picture_url
                        ],
                    )
                    user = cur.fetchone()
                    print("USER", type(user))
                    if not user:
                        raise UserDatabaseException(
                            f"Could not create user with username {username}"
                        )
        except psycopg.Error:

            raise UserDatabaseException(
                f"Could not create user with username {username}"
            )
        return user

    def update_user(self, username: str, password: str, email: str, score: int, picture_url: str) -> Optional[UserIn]:

        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(UserIn)) as cur:
                    cur.execute(
                        """
                        UPDATE users (
                            username,
                            password,
                            email,
                            score,
                            picture_url
                        ) VALUES (
                            %s, %s, %s, %s, %s
                        )
                        RETURNING *;
                        """,
                        [
                            username,
                            password,
                            email,
                            score,
                            picture_url
                        ],
                    )
                    user = cur.fetchone()
                    if not user:
                        raise UserDatabaseException(
                            f'{"Could not update user with username {username} pooled"}'
                        )
        except psycopg.Error:
            raise UserDatabaseException(
                f"Could not update user with username {username}"
            )
        return user

    def delete_user(self, username: str):
        try:
            with pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        DELETE FROM users
                        WHERE username = %s;
                        """,
                        [username],
                    )
                    if cur.rowcount == 0:
                        raise UserDatabaseException(
                            f"User with username {username} not found"
                        )
        except psycopg.Error as e:
            raise UserDatabaseException(
                f"Error deleting user with username {username}: {e}"
            )

    def list_club_members(self, club_id: int) -> Optional[List[UserOut]]:
        """
        Get all of a club's members by club_id.

        :param club_id: The identifier of the club.
        :return: A list of UserResponse objects representing the members of the club, or None if no members found.
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(UserOut)) as cur:
                    cur.execute(
                        """
                        SELECT u.*
                        FROM users u
                        INNER JOIN clubs_members cm ON u.id = cm.member_id
                        WHERE cm.club_id = %s;
                        """,
                        (club_id,)
                    )
                    club_members = cur.fetchall()
                    if not club_members:
                        return None

        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f'{"Error getting club members"}')
        return club_members

    def join_club(self, club_id: int, member_id: int) -> Optional[MemberResponse]:
        """

        :param club_id: The identifier of the club.
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(MemberResponse)) as cur:
                    cur.execute(
                        """
                        INSERT INTO clubs_members (
                        club_id, member_id
                        )
                        VALUES (
                        %s, %s
                        )

                        RETURNING *;
                        """,
                        [club_id, member_id]
                    )
                    club_members = cur.fetchone()
                    if not club_members:
                        return None
            return club_members
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f'{"Error getting club members"}')
