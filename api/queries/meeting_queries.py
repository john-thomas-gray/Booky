"""
Database Queries for Meetings
"""

import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional, List
from models.meetings import MeetingResponse, MeetingClubResponse, AttendeeResponse
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
                          *
                        FROM meetings
                        WHERE id = %s
                      """,
                      [id],
                    )
                    meeting = cur.fetchone()
                    if not meeting:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting meeting with id: {id}")
        return meeting

    def create_meeting(
        self,
        club_id: int,
        club_name: str,
        club_score: int,
        book_title: str,
        total_pages: int,
        current_page: int,
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
                    INSERT INTO meetings (
                      club_id, club_name, club_score, book_title, total_pages, current_page, active
                    ) VALUES (
                      %s, %s, %s, %s, %s, %s, %s
                    )
                    RETURNING *;
                  """,
                  [
                    club_id,
                    club_name,
                    club_score,
                    book_title,
                    total_pages,
                    current_page,
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
                      SELECT clubs.club_id, meetings.active, meetings.id, meetings.book_title
                      FROM meetings
                      LEFT JOIN clubs
                      ON clubs.club_id = meetings.club_id

                      WHERE clubs.club_id = %s;
                      """,
                      [club_id],
                    )
                    meetings_by_club = cur.fetchall()
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting meetings: {e}")

        return meetings_by_club

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
                              *
                          FROM meetings
                          WHERE club_id = %s
                          """,
                          (club_id,)
                        )
                    else:
                        cur.execute(
                          """
                          SELECT
                              *
                          FROM meetings
                          """
                        )
                    meetings = cur.fetchall()
                    if not meetings:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting meetings: {e}")
        return meetings

    def list_attendees_by_meeting(self, id: int) -> Optional[List[AttendeeResponse]]:
        """
        gets all meetings given a club id
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(AttendeeResponse)) as cur:
                    cur.execute(
                      """
                      SELECT meetings_attendees.meeting_id, meetings_attendees.attendee_id, users.username
                      FROM meetings_attendees
                      LEFT JOIN meetings
                      ON meetings.id = meetings_attendees.meeting_id

                      LEFT JOIN users
                      ON users.id = meetings_attendees.attendee_id

                      WHERE meetings_attendees.meeting_id = %s;
                      """,
                      [id],
                    )
                    attendees_by_meeting = cur.fetchall()
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting attendees: {e}")

        return attendees_by_meeting

    def join_meeting(self, meeting_id: int, attendee_id: int) -> Optional[AttendeeResponse]:
        """
        allows user to join meeting as an attendee
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(AttendeeResponse)) as cur:
                    cur.execute(
                      """
                      INSERT INTO meetings_attendees (
                        meeting_id,
                        attendee_id
                      )
                      VALUES (
                      %s, %s
                      )

                      RETURNING *;
                      """,
                      [meeting_id, attendee_id]
                    )
                    attendee = cur.fetchone()
                    if not attendee:
                        return None
            return attendee
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f'{"Error joining meeting"}')
