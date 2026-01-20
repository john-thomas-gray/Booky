"""
Database Queries for Meetings
"""

import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional, List
from models.meetings import MeetingResponse, MeetingClubResponse
from models.users import UserOut
from utils.exceptions import UserDatabaseException
from datetime import datetime

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

pool = ConnectionPool(DATABASE_URL)


class MeetingQueries:
    """
    Class containing queries for the Meetings table

    Can be dependency injected into a route like so

    def my_route(meetingQueries: MeetingQueries = Depends()):
        # Here you can call any of the functions to query the DB
    """

    def get_by_id(self, id: int) -> Optional[MeetingResponse]:
        """
        Gets a meeting from the database by id

        Returns None if the meeting isn't found
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(MeetingResponse)) as cur:
                    cur.execute(
                      """
                        SELECT
                          meetings.id,
                          meetings.club_id,
                          meetings.active,
                          books.title AS book_title
                        FROM meetings
                        INNER JOIN books
                          ON books.book_id = meetings.book_id
                        WHERE meetings.id = %s
                      """,
                      [id],
                    )
                    meeting = cur.fetchone()
                    if not meeting:
                        return None
                return meeting
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting meeting with id: {id}")

    def create_meeting(
        self,
        club_id: int,
        book_title: str,
        active: datetime
      ):
        """
        Creates a new meeting in the database

        Raises a MeetingInsertionException if creating the meeting fails (ADD LATER)
        """
        with pool.connection() as conn:
            with conn.cursor(row_factory=class_row(MeetingResponse)) as cur:
                cur.execute(
                  """
                    WITH inserted AS (
                      INSERT INTO meetings (
                        club_id, book_id, active
                      ) VALUES (
                        %s,
                        (SELECT book_id FROM books WHERE title = %s),
                        %s
                      )
                      RETURNING id, club_id, book_id, active
                    )
                    SELECT
                      inserted.id,
                      inserted.club_id,
                      inserted.active,
                      books.title AS book_title
                    FROM inserted
                    INNER JOIN books
                      ON books.book_id = inserted.book_id;
                  """,
                  [
                    club_id,
                    book_title,
                    active
                  ],
                )
                meeting = cur.fetchone()

        return meeting

    def delete_meeting(self, id: int) -> bool:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                      """
                      DELETE FROM meetings
                      WHERE id = %s
                      """,
                      [id]
                    )
                    return True
        except Exception as e:
            print(e)
            print("error with delete_meeting query")
            return False

    def list_meetings_by_club(self, club_id: int) -> Optional[List[MeetingClubResponse]]:
        """
        gets all meetings given a club id
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(MeetingClubResponse)) as cur:
                    cur.execute(
                      """
                      SELECT
                        clubs.club_id,
                        meetings.active,
                        meetings.id,
                        books.title AS book_title
                      FROM meetings
                      INNER JOIN books
                        ON books.book_id = meetings.book_id
                      LEFT JOIN clubs
                        ON clubs.club_id = meetings.club_id
                      WHERE clubs.club_id = %s;
                      """,
                      [club_id],
                    )
                    meetings_by_club = cur.fetchall()
            return meetings_by_club
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting meetings: {e}")

    def list_meetings(self, club_id: Optional[int] = None) -> Optional[List[MeetingResponse]]:
        """
        Lists all meetings
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(MeetingResponse)) as cur:
                    if club_id is not None:
                        cur.execute(
                          """
                          SELECT
                            meetings.id,
                            meetings.club_id,
                            meetings.active,
                            books.title AS book_title
                          FROM meetings
                          INNER JOIN books
                            ON books.book_id = meetings.book_id
                          WHERE meetings.club_id = %s
                          """,
                          (club_id,)
                        )
                    else:
                        cur.execute(
                          """
                          SELECT
                            meetings.id,
                            meetings.club_id,
                            meetings.active,
                            books.title AS book_title
                          FROM meetings
                          INNER JOIN books
                            ON books.book_id = meetings.book_id
                          """
                        )
                    meetings = cur.fetchall()
                    if not meetings:
                        return None
                    return meetings
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting meetings: {e}")

    def list_users_by_meeting(self, meeting_id: int) -> Optional[List[UserOut]]:
        """
        gets all users given a meeting id
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(UserOut)) as cur:
                    cur.execute(
                      """
                      SELECT u.*
                      FROM users u
                      INNER JOIN meetings_attendees ma ON u.id = ma.attendee_id
                      WHERE ma.meeting_id = %s;
                      """,
                      [meeting_id],
                    )
                    users_by_meeting = cur.fetchall()
                return users_by_meeting
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting attendees: {e}")

    def list_meetings_by_user(self, user_id: int) -> Optional[List[MeetingResponse]]:
        """
        gets all meetings given a club id
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(MeetingResponse)) as cur:
                    cur.execute(
                      """
                      SELECT
                        m.id,
                        m.club_id,
                        m.active,
                        b.title AS book_title
                      FROM meetings m
                      INNER JOIN books b
                        ON b.book_id = m.book_id
                      INNER JOIN meetings_attendees ma
                        ON m.id = ma.meeting_id
                      WHERE ma.attendee_id = %s;
                      """,
                      [user_id],
                    )
                    meetings_by_user = cur.fetchall()
                return meetings_by_user
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting attendees: {e}")
