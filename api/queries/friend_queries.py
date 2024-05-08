"""
Database Queries for Users
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import List
from models.friends import FriendResponse, FriendsResponse
from utils.exceptions import UserDatabaseException

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

pool = ConnectionPool(DATABASE_URL)


class FriendQueries:
    """
    Class containing queries for the Friends table

    Can be dependency injected into a route like so

    def my_route(friendQueries: FriendQueries = Depends()):
        # Here you can call any of the functions to query the DB
    """

    def add_friend(self, member_id: int, friend_id: int):
        """
        Creates a new club in the database

        Raises a ClubInsertionException if creating the club fails (ADD LATER)
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(FriendResponse)) as cur:
                    cur.execute(
                        """

                        INSERT INTO friends (
                        member_id, friend_id
                        ) VALUES (
                        %s, %s
                        )
                        RETURNING *;
                        """,
                        [
                            member_id,
                            friend_id
                        ],
                    )
                    friend = cur.fetchone()
                    if not friend:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error adding friend with id: {friend_id}")
        return friend

    def list_friends(self) -> List[FriendsResponse]:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(FriendsResponse)) as cur:
                    cur.execute(
                        """

                        SELECT m.username as username, f.username as friend_username
                        FROM friends
                        JOIN users m on friends.member_id = m.id
                        JOIN users f on friends.friend_id = f.id;

                        """,
                    )
                    friend = cur.fetchall()
                    if not friend:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException("Error listing friends")
        return friend

    def list_friends_by_id(self, member_id: int) -> List[FriendsResponse]:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(FriendsResponse)) as cur:
                    cur.execute(
                        """

                        SELECT m.username as username, f.username as friend_username, f.id as friend_id
                        FROM friends
                        JOIN users f on friends.friend_id = f.id
                        JOIN users m on friends.member_id = m.id
                        WHERE friends.member_id = %s;

                        """,
                        [member_id]
                    ),

                    friend = cur.fetchall()
                    if not friend:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException("Error listing friends")
        return friend

    def remove_friend(self, member_id: int, friend_id: int) -> bool:
        """
        Deletes friend relationship from the database
        """
        try:
            with pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        DELETE FROM friends
                        WHERE member_id = %s AND friend_id = %s;

                        """,
                        [member_id, friend_id]
                    ),
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException("Error Deleting Relationship")
        return True
