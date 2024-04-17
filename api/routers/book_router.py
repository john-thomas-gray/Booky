"""
Book API Router
"""

from fastapi import (
    Depends,
    Request,
    Response,
    HTTPException,
    status,
    APIRouter,
)
from queries.book_queries import (
  BookQueries,
)

from models.books import BookRequest, BookResponse

router = APIRouter(tags=["Books"], prefix="/api/books")

@router.post("/")
async def create_book(
  new_book: BookRequest,
  request: Request,
  response: Response,
  queries: BookQueries = Depends(),
) -> BookResponse:

  book = queries.create_book(
    new_book.title,
    new_book.author,
    new_book.page_count,
    new_book.genre,
    new_book.publisher,
    new_book.publication_date,
    new_book.synopsis,
    new_book.cover_img_url,
  )
  book_out = BookResponse(**book.model_dump())
  return book_out
