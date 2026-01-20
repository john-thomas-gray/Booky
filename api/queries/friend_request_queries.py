"""
Database Queries for friend requests
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional, List
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

    def send_request(self, user_id: int, friend_id: int):
        """
        Creates a new friend request in the database

        Raises a UserDatabaseException if creating the request fails
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(FriendRequestResponse)) as cur:
                    cur.execute(
                        """
                        WITH inserted AS (
                          INSERT INTO friendships (
                            user_id,
                            friend_id,
                            status,
                            requested_by
                          ) VALUES (
                            LEAST(%s, %s),
                            GREATEST(%s, %s),
                            'pending',
                            %s
                          )
                          ON CONFLICT (user_id, friend_id)
                          DO UPDATE SET
                            status = 'pending',
                            requested_by = EXCLUDED.requested_by
                          RETURNING user_id, friend_id, requested_by, status
                        )
                        SELECT
                          CASE
                            WHEN inserted.requested_by = inserted.user_id
                              THEN inserted.friend_id
                            ELSE inserted.user_id
                          END AS user_id,
                          inserted.requested_by AS friend_id,
                          users.username AS friend_name,
                          inserted.status
                        FROM inserted
                        JOIN users ON users.id = inserted.requested_by;
                        """,
                        [
                            user_id,
                            friend_id,
                            user_id,
                            friend_id,
                            friend_id,
                        ],
                    )
                    request = cur.fetchone()
                    if not request:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error adding friend with id: {user_id}")
        return request

    def deny_request(self, user_id: int, friend_id: int) -> bool:
        """
        Deletes club from the database
        """
        try:
            with pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        DELETE FROM friendships
                        WHERE user_id = LEAST(%s, %s)
                        AND friend_id = GREATEST(%s, %s)
                        AND status = 'pending';

                        """,
                        [
                            user_id,
                            friend_id,
                            user_id,
                            friend_id,
                        ],
                    )

        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException('Could not delete relationship')
        return True

    def list_requests(self) -> Optional[List[FriendRequestResponse]]:
        """
        Gets all friend requests from the database

        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(FriendRequestResponse)) as cur:
                    cur.execute(
                      """
                        SELECT
                          CASE
                            WHEN friendships.requested_by = friendships.user_id
                              THEN friendships.friend_id
                            ELSE friendships.user_id
                          END AS user_id,
                          friendships.requested_by AS friend_id,
                          users.username AS friend_name,
                          friendships.status
                        FROM friendships
                        JOIN users ON users.id = friendships.requested_by
                        WHERE friendships.status = 'pending'
                        ORDER BY user_id;

                      """,
                    )
                    requests = cur.fetchall()
                    if not requests:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException('Error getting requests')
        return requests
