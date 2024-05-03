"""
Database Queries for Attendees
"""

import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional, List
from models.attendees import AttendeeResponse, AttendeeUpdate
from utils.exceptions import UserDatabaseException

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

pool = ConnectionPool(DATABASE_URL)


class AttendeeQueries:

    def list_attendees_by_meeting(self, meeting_id: int) -> Optional[List[AttendeeResponse]]:
        """
        gets all attendees given a meeting id
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(AttendeeResponse)) as cur:
                    cur.execute(
                      """
                      SELECT ma.*
                      FROM meetings_attendees ma
                      WHERE ma.meeting_id = %s;
                      """,
                      [meeting_id],
                    )
                    attendees_by_meeting = cur.fetchall()
                return attendees_by_meeting
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException(f"Error getting attendees: {e}")

    def update_attendee(
            self,
            attendee_page: int,
            meeting_id: int,
            user_id: int,
            place_at_last_finish: int,
            finished: bool
            ) -> Optional[AttendeeUpdate]:
        """
        Updates attendee score in the meetings_attendees table, allowing the score users
        have accrued in individual meetings to be tracked.
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(AttendeeUpdate)) as cur:
                    cur.execute(
                        """
                        UPDATE meetings_attendees
                        SET attendee_page=%s, place_at_last_finish=%s, finished=%s
                        WHERE meeting_id = %s AND attendee_id = %s
                        RETURNING attendee_page, meeting_id, attendee_id, place_at_last_finish, finished;
                        """,
                        (attendee_page, place_at_last_finish, finished, meeting_id, user_id),
                    )
                    updated_attendee_page = cur.fetchone()
                    print("!!!!", updated_attendee_page)
                    if not updated_attendee_page:
                        return None
                    return updated_attendee_page
        except psycopg.Error as e:
            raise UserDatabaseException(f"Error updating user attendee_page in meeting: {e}")

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
                    return page
        except psycopg.Error as e:
            print(e)
            raise UserDatabaseException("Error getting attendee page")

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

    def leave_meeting(self, meeting_id: int, attendee_id: int) -> bool:
        """
        allows user to join meeting as an attendee
        """
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                      """
                      DELETE FROM meetings_attendees
                      WHERE meeting_id = %s AND attendee_id = %s
                      """,
                      [meeting_id, attendee_id]
                    )
                    print("you have left the meeting")
                    return True
        except Exception as e:
            print(e)
            print("error with leaving meeting you are stuck fool")
            return False
