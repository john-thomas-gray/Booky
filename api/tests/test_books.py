from main import app
from fastapi.testclient import TestClient
from queries.book_queries import BookQueries
from models.books import BookResponse

client = TestClient(app)


class EmptyBookQueries:
    def list_books(self):
        return []


class CreateBookQueries:
    def create_book(self, title: str, author: str, page_count: int, genre: str, synopsis: str, cover_img_url: str):
        book = BookResponse(
            book_id=1,
            title=title,
            author=author,
            page_count=page_count,
            genre=genre,
            synopsis=synopsis,
            cover_img_url=cover_img_url
        )
        return book


def test_get_all_books():
    app.dependency_overrides[BookQueries] = EmptyBookQueries

    response = client.get("/books/")

    app.dependency_overrides = {}

    assert response.status_code == 200
    assert response.json() == []


def test_create_book():
    app.dependency_overrides[BookQueries] = CreateBookQueries

    json_data = {
        "title": "New Book",
        "author": "Author Name",
        "page_count": 1234567890,
        "genre": "Fiction",
        "synopsis": "Blah Blah Blah",
        "cover_img_url": "asdasddas"
    }
    expected = {
        "book_id": 1,
        "title": "New Book",
        "author": "Author Name",
        "page_count": 1234567890,
        "genre": "Fiction",
        "synopsis": "Blah Blah Blah",
        "cover_img_url": "asdasddas"
    }

    response = client.post("/book/", json=json_data)
    app.dependency_overrides = {}

    assert response.status_code == 200
    assert response.json() == expected
