"""
Database Queries for Books
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional
from models.books import BookResponse
from utils.exceptions import BookDatabaseException
from datetime import datetime

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
  raise ValueError("DATABASE_URL environment variable is not set")

pool = ConnectionPool(DATABASE_URL)


class BookQueries:

  def get_by_id(self, id: int) -> Optional[BookResponse]:
    try:
      with pool.connection() as conn:
        with conn.cursor(row_factory=class_row(BookResponse)) as cur:
          cur.execute(
            """
              SELECT
                *
              FROM books
              WHERE id = %s
            """,
            [id],
          )
          book = cur.fetchone()
          if not book:
            return None
    except psycopg.Error as e:
      print(e)
      raise BookDatabaseException(f"Error getting book with id {id}")
    return book

  def create_book(self, title: str, author: str, page_count: int, genre: str, publisher: str, publication_date: datetime, synopsis: str, cover_img_url: str):
    with pool.connection() as conn:
      with conn.cursor(row_factory=class_row(BookResponse)) as cur:
        cur.execute(
          """
            INSERT INTO clubs (
              title, author, page_count, genre, publisher, publication_date, synopsis, cover_img_url
            ) VALUES (
              %s, %s, %s, %s, %s, %s, %s, %s
            )
            RETURNING *;
          """,
          [
            title,
            author,
            page_count,
            genre,
            publisher,
            publication_date,
            synopsis,
            cover_img_url,
          ],
        )
        book = cur.fetchone()

    return book
