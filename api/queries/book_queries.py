"""
Database Queries for books
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from typing import Optional
from datetime import datetime
from models.books import BookResponse


DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

pool = ConnectionPool(DATABASE_URL)
class BookQueries:
    def get_by_id(self, id: int) -> Optional[BookResponse]:
        try:
            with pool.getconn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT * FROM books WHERE id = %s
                        """,
                        [id],
                    )
                    book = cur.fetchone()
                    if not book:
                        return None
                    return BookResponse(*book)
        except psycopg.Error as e:
            print(e)

    def create_book(self, title: str, author: str, page_count: int, genre: str, publisher: str, publication_date: datetime, synopsis: str, cover_img_url: str):  # Added missing colon
        try:
            with pool.getconn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO books (
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
                    return BookResponse(*book)
        except psycopg.Error as e:
            print(e)


"""
Deletes Book from Database
"""

class BookQueries:

    def delete_book(self, id: int) -> None:
        try:
            with pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        DELETE FROM books WHERE book_id = %s
                        """,
                        [id],
                    )
                    conn.commit()
        except psycopg.Error as e:
            print(e)
