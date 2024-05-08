"""
Database Queries for friend requests
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
# from typing import List
from models.friend_request import FriendRequestResponse
from utils.exceptions import UserDatabaseException

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

pool = ConnectionPool(DATABASE_URL)


class FriendRequestQueries:
    """
    Class containing queries for the request table

    Can be dependency injected into a route like so

    def my_route(friendRequestQueries: FriendRequestQueries = Depends()):
        # Here you can call any of the functions to query the DB
    """

    def send_request(self, user_id: int, friend_id: int, friend_name: str):
        """
        Creates a new friend request in the database

        Raises a UserDatabaseException if creating the request fails
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(FriendRequestResponse)) as cur:
                    cur.execute(
                        """

                        INSERT INTO request (
                        user_id, friend_id, friend_name
                        ) VALUES (
                        %s, %s, %s
                        )
                        RETURNING *;
                        """,
                        [
                            user_id,
                            friend_id,
                            friend_name
                        ],
                    )
                    request = cur.fetchone()
                    if not request:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error adding friend with id: {user_id}")
        return request
