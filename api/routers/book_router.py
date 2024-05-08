"""
Book API Router
"""
import requests
import os
from fastapi import APIRouter, Depends, Request, Response
from queries.book_queries import BookQueries
from models.books import BookRequest, BookResponse
from utils.exceptions import UserDatabaseException
router = APIRouter(tags=["Book"])


@router.post("/book")
def create_book(
    new_book: BookRequest,
    request: Request,
    response: Response,
    queries: BookQueries = Depends(),
) -> BookResponse:
    """
    Creates a new book after form is filled out
    """

    # Create the book database
    book = queries.create_book(
        new_book.title,
        new_book.author,
        new_book.page_count,
        new_book.genre,
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
        queries.delete_books(book_id)
        return True
    except UserDatabaseException:
        return False


@router.get("/books/title/{title}")
def get_by_title(
    title: str,
    response: Response,
        queries: BookQueries = Depends()) -> BookResponse:
    book = queries.get_by_title(title)
    if book is None:
        response.status_code = 404
    return book


@router.get("/books")
def list_books(
    response: Response,
        queries: BookQueries = Depends()):

    """
    Endpoint to list all books available in the library.
    """

    books = queries.list_books()
    if books is None:
        response.status_code = 404
        return []
    return books


@router.get("/getbooks/{title}")
def get_book(title: str):
    GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")
    # GOOGLE_BOOKS_API_KEY = "AIzaSyBhVYIvBYwae-smPMiNhZsRe9_APprNIUA"
    url = f'https://www.googleapis.com/books/v1/volumes?q={title}&key={GOOGLE_BOOKS_API_KEY}'
    print(url)
    response1 = requests.get(url=url)
    book = response1.json()

    return (book)
