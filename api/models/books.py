"""
Pydantic Models for Books.
"""
from pydantic import BaseModel


class BookRequest(BaseModel):
    """
    Represents the parameters needed to create a new book
    """

    title: str
    author: str
    page_count: int
    genre: str
    synopsis: str
    cover_img_url: str


class BookResponse(BaseModel):
    """
    Represents a book
    """

    book_id: int
    title: str
    author: str
    page_count: int
    genre: str
    synopsis: str
    cover_img_url: str
