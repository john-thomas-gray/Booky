"""
Database Queries for Friends
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
    Class containing queries for the Friendships table

    Can be dependency injected into a route like so

    def my_route(friendQueries: FriendQueries = Depends()):
        # Here you can call any of the functions to query the DB
    """

    def add_friend(self, member_id: int, friend_id: int):
        """
        Creates a new friend relationship in the database

        Raises a UserDatabaseException if creating the relationship fails
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(FriendResponse)) as cur:
                    cur.execute(
                        """

                        INSERT INTO friendships (
                            user_id,
                            friend_id,
                            status,
                            requested_by
                        ) VALUES (
                            LEAST(%s, %s),
                            GREATEST(%s, %s),
                            'accepted',
                            %s
                        )
                        ON CONFLICT (user_id, friend_id)
                        DO UPDATE SET status = 'accepted'
                        RETURNING user_id AS member_id, friend_id;
                        """,
                        [
                            member_id,
                            friend_id,
                            member_id,
                            friend_id,
                            member_id,
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

                        SELECT
                            u1.username as username,
                            u2.id as friend_id,
                            u2.username as friend_username
                        FROM friendships
                        JOIN users u1 on friendships.user_id = u1.id
                        JOIN users u2 on friendships.friend_id = u2.id
                        WHERE friendships.status = 'accepted'
                        UNION ALL
                        SELECT
                            u2.username as username,
                            u1.id as friend_id,
                            u1.username as friend_username
                        FROM friendships
                        JOIN users u1 on friendships.user_id = u1.id
                        JOIN users u2 on friendships.friend_id = u2.id
                        WHERE friendships.status = 'accepted';

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

                        SELECT
                            m.username as username,
                            CASE
                                WHEN friendships.user_id = %s
                                    THEN friendships.friend_id
                                ELSE friendships.user_id
                            END AS friend_id,
                            f.username as friend_username
                        FROM friendships
                        JOIN users m on m.id = %s
                        JOIN users f
                            ON f.id = CASE
                                WHEN friendships.user_id = %s
                                    THEN friendships.friend_id
                                ELSE friendships.user_id
                            END
                        WHERE (friendships.user_id = %s OR friendships.friend_id = %s)
                        AND friendships.status = 'accepted';

                        """,
                        [
                            member_id,
                            member_id,
                            member_id,
                            member_id,
                            member_id,
                        ]
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
                        DELETE FROM friendships
                        WHERE user_id = LEAST(%s, %s)
                        AND friend_id = GREATEST(%s, %s);

                        """,
                        [member_id, friend_id, member_id, friend_id]
                    ),
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException("Error Deleting Relationship")
        return True
