from main import app
from fastapi.testclient import TestClient
from queries.club_queries import ClubQueries
from pydantic import BaseModel
from models.clubs import ClubResponse
from utils.authentication import try_get_jwt_user_data


client = TestClient(app)


def test_init():
    assert 1 == 1


class EmptyClubQueries:
    def list_clubs(self):
        return []


class PostClubQueries:
    def create_club(self, name: str, city: str, state: str, country: str):
        club = ClubResponse(
            owner_id=1,
            club_id=1,
            name=name,
            city=city,
            state=state,
            country=country
        )
        return club


class UserOut(BaseModel):
    username: str
    password: str
    email: str
    score: int
    picture_url: str


def fake_get_account_data():
    return UserOut(username="John", password="hello", email="youngmula@youngmoney.com", score=0, picture_url="asdfadsf@google.com")


def test_get_all_clubs():
    app.dependency_overrides[try_get_jwt_user_data] = fake_get_account_data
    app.dependency_overrides[ClubQueries] = EmptyClubQueries

    response = client.get("/api/clubs")
    app.dependency_overrides = {}

    assert response.status_code == 200
    assert response.json() == []


def test_create_new_club():
    app.dependency_overrides[ClubQueries] = PostClubQueries
    club = {
        "owner_id": 1,
        "name": "Read This",
        "city": "Phoenix",
        "state": "AZ",
        "country": "US"
    }
    expected = {
        "owner_id": 1,
        "club_id": 1,
        "name": "Read This",
        "city": "Phoenix",
        "state": "AZ",
        "country": "US"
    }

    response = client.post("/api/clubs", json=club)
    app.dependency_overrides = {}

    assert response.status_code == 200
    assert response.json() == expected
