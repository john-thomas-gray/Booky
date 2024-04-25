"""
Database Queries for books
Database Queries for books
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from typing import Optional
from datetime import datetime
from datetime import datetime
from models.books import BookResponse


DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")
    raise ValueError("DATABASE_URL environment variable is not set")

pool = ConnectionPool(DATABASE_URL)

class BookQueries:

    """
    Class containing queries for the Books table

    Can be dependency injected into a route like so


    """
    def get_by_id(self, book_id: int) -> Optional[BookResponse]:

        """
        Gets a meeting from the database by id

        Returns None if the Book is not found
        """
        try:
            with pool.getconn() as conn:
                with conn.cursor(row_factory=class_row(BookResponse)) as cur:
                    cur.execute(
                        """
                        SELECT * FROM books WHERE book_id = %s
                        """,
                        [book_id],
                    )
                    book = cur.fetchone()
                    if not book:
                        return None
        except psycopg.Error as e:
            print(e)

        return book

    def create_book(self, title: str, author: str, page_count: int, genre: str, publisher: str, synopsis: str, cover_img_url: str):
        """
        Creates a new book in the database

        """

        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(BookResponse)) as cur:
                    cur.execute(
                    """

                        INSERT INTO books (
                        title, author, page_count, genre, publisher,  synopsis, cover_img_url
                        ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s
                        )
                        RETURNING *;
                    """,

                    [
                        title,
                        author,
                        page_count,
                        genre,
                        publisher,

                        synopsis,
                        cover_img_url,
                    ],
                    )

                    book = cur.fetchone()
                    if not book:
                        raise UserDatabaseException(
                            f"Could not create book with book_id {book_id}"
                        )
        except psycopg.Error:
            raise UserDatabaseException(
                f"Count not create book with book_id {book_id}"
            )

        return book

    def delete_book(self, book_id: int):
        try:
            with pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        DELETE FROM books WHERE book_id = %s
                        """,
                        [book_id],
                    )
                    if cur.rowcount == 0:
                        raise UserDatabaseException(
                            f"Book with book_id {book_id} not found"
                        )
        except:
            pass
        # except psycopg.Error as e:
        #     raist BookDatabaseException(
        #         f"Error deleting book with book_id {book_id}: {e}"
        #     )
