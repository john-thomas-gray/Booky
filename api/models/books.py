"""
Pydantic Models for Books.
"""
from pydantic import BaseModel
from datetime import datetime

class BookRequest(BaseModel):
  """
  Represents the parameters needed to create a new book
  """

  title: str
  author: str
  page_count: int
  genre: str
  publisher: str
  # publication_date: datetime
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
  publisher: str
  # publication_date: datetime
  synopsis: str
  cover_img_url: str
