"""
Book API Router
"""

from fastapi import APIRouter, Depends, Request, Response, HTTPException
from queries.book_queries import BookQueries
from models.books import BookRequest, BookResponse

router = APIRouter(tags=["Book"], prefix="/api/book")

@router.post("/book")
async def create_book(
    new_book: BookRequest,
    queries: BookQueries = Depends()
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
    book_out = BookResponse(**book)
    return book_out

@router.delete("/book/{book_id}", response_model=BookResponse)
async def delete_book(
    book_id: int,
    queries: BookQueries = Depends()
) -> BookResponse:
    deleted_book = queries.delete_book(book_id)
    if deleted_book:
        return deleted_book
    else:
        raise HTTPException(status_code=404, detail="Book not found")
