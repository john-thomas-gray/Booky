"""
Database Queries for Meetings
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional
from models.meetings import MeetingResponse
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

  def delete(self, id:int) -> bool:
    try:
      with pool.connection() as conn:
        with conn.cursor() as db:
          db.execute(
            """
            DELETE FROM meetings
            WHERE id = %s
            """,
            [id],
          )
          return True
    except Exception:
      return False
