"""
Database Queries for Users
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional, List
from models.users import UserWithPw, UserResponse
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

    def get_by_id_pw(self, id: int) -> Optional[UserWithPw]:
        """
        Gets a user from the database by user id

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

    def get_by_id(self, id: int) -> Optional[UserResponse]:
        """
        Gets a user from the database by user id

        Returns None if the user isn't found
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(UserResponse)) as cur:
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

    def list_users(self) -> Optional[List[UserResponse]]:
        """
        Get list of all users
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(UserResponse)) as cur:
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
            raise UserDatabaseException(f"Error getting users")
        return users


    def create_user(
            self,
            username: str,
            hashed_password: str,
            email: str,
            first_name: Optional[str],
            last_name: Optional[str],
            avatar_url: Optional[str],
            bio: Optional[str]
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
                            first_name,
                            last_name,
                            avatar_url,
                            bio

                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s
                        )
                        RETURNING *;
                        """,
                        [
                            username,
                            hashed_password,
                            email,
                            first_name,
                            last_name,
                            avatar_url,
                            bio
                        ],
                    )
                    user = cur.fetchone()
                    if not user:
                        raise UserDatabaseException(
                            f"Could not create user with username {username}"
                        )
        except psycopg.Error:
            raise UserDatabaseException(
                f"Could not create user with username {username}"
            )
        return user

    def update_user(self, username: str, password: str, email: str, first_name: str, last_name: str, avatar_url: str, bio: str) -> Optional[UserWithPw]:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(UserWithPw)) as cur:
                    cur.execute(
                        """
                        UPDATE users (
                            username,
                            password,
                            email,
                            first_name,
                            last_name,
                            avatar_url,
                            bio
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s
                        )
                        RETURNING *;
                        """,
                        [
                            username,
                            password,
                            email,
                            first_name,
                            last_name,
                            avatar_url,
                            bio
                        ],
                    )
                    user = cur.fetchone()
                    if not user:
                        raise UserDatabaseException(
                f"Could not update user with username {username}"
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
