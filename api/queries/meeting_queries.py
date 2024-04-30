"""
Database Queries for Meetings
"""

import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional, List
from models.meetings import MeetingResponse, MeetingClubResponse, AttendeeResponse, AttendeePageUpdate
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

    def list_attendees_by_meeting(self, meeting_id: int) -> Optional[List[UserOut]]:
        """
        gets all meetings given a club id
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
                    attendees_by_meeting = cur.fetchall()
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting attendees: {e}")
        return attendees_by_meeting

    def list_meetings_by_user(self, user_id: int) -> Optional[List[MeetingResponse]]:
        """
        gets all meetings given a club id
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(MeetingResponse)) as cur:
                    cur.execute(
                      """
                      SELECT m.*
                      FROM meetings m
                      INNER JOIN meetings_attendees ma ON m.id = ma.meeting_id
                      WHERE ma.attendee_id = %s;
                      """,
                      [user_id],
                    )
                    meetings_by_user = cur.fetchall()
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting attendees: {e}")

        return meetings_by_user

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

    def update_attendee_page(self, attendee_page: int, meeting_id: int, user_id: int) -> Optional[AttendeePageUpdate]:
        """
        Updates attendee score in the meetings_attendees table, allowing the score users
        have accrued in individual meetings to be tracked.
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(AttendeePageUpdate)) as cur:
                    cur.execute(
                        """
                        UPDATE meetings_attendees
                        SET attendee_page=%s
                        WHERE meeting_id = %s AND attendee_id = %s
                        RETURNING attendee_page, meeting_id, attendee_id;
                        """,
                        (attendee_page, meeting_id, user_id),
                    )
                    updated_attendee_page = cur.fetchone()
                    if not updated_attendee_page:
                        return None
        except psycopg.Error as e:
            raise UserDatabaseException(f"Error updating user attendee_page in meeting: {e}")
        return updated_attendee_page

    def get_attendee(self, meeting_id: int, user_id: int) -> Optional[AttendeeResponse]:
        """
        Gets the page of the book for a specific user in a specific meeting
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(AttendeeResponse)) as cur:
                    cur.execute(
                        """
                        SELECT
                        *
                        FROM meetings_attendees
                        WHERE meeting_id = %s AND attendee_id = %s
                        """,
                        [meeting_id, user_id]
                    )
                    page = cur.fetchone()
                    if not page:
                        return None
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException("Error getting attendee page")
        return page
