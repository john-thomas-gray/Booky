"""
Book API Router
"""

from fastapi import APIRouter, Depends, Request, Response, HTTPException
from queries.book_queries import BookQueries
from models.books import BookRequest, BookResponse

router = APIRouter(tags=["Book"])

@router.post("/book")
def create_book(
    new_book: BookRequest,
    request: Request,
    response: Response,
    queries: BookQueries = Depends()
) -> BookResponse:
    """
    Creates a new book after form is filled out
    """

    # Create the book database
    book = queries.create_book(
        new_book.title,
        new_book.author,
        new_book.page_count,
        # new_book.genre,
        # new_book.publisher,
        # new_book.publication_date,
        new_book.synopsis,
        new_book.cover_img_url
    )
    book_out = BookResponse(**book.model_dump())

    return book_out

@router.delete("/book/{book_id}")
async def delete_book(
    book_id: int,
    queries: BookQueries = Depends(),) -> bool:

    try:
        queries.delete_books(id)
        return True
    except:
        return False

@router.get("/books/{id}")
def get_book(
    id: int,
    response: Response,
    queries: BookQueries = Depends(),) -> BookResponse:
    book = queries.get_by_id(id)
    if book is None:
        response.status_code = 404
    print(book)
    return book
