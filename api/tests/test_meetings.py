from main import app
from fastapi.testclient import TestClient
from queries.meeting_queries import MeetingQueries
from pydantic import BaseModel
from models.meetings import MeetingResponse
from utils.authentication import try_get_jwt_user_data


client = TestClient(app)


def test_init():
    assert 69 != 1


class EmptyMeetingQueries:
    def list_meetings(self):
        return []


class TestMeetingQueries:
    def create_meeting(self, club_id: int, book_title: str, active: str):
        meeting = MeetingResponse(
            id=1,
            club_id=1,
            book_title=book_title,
            active=active
        )
        return meeting


class UserTest(BaseModel):
    username: str
    password: str
    email: str
    score: int
    picture_url: str


def test_get_account_data():
    return UserTest(username="test", password="test", email="test@test.com", score=0, picture_url="offensivetest@google.com")


def test_create_new_meeting():
    app.dependency_overrides[try_get_jwt_user_data] = test_get_account_data
    app.dependency_overrides[MeetingQueries] = TestMeetingQueries
    meeting = {
        "id": 1,
        "club_id": 1,
        "book_title": "Monty Python and The Holy Grail",
        "active": "1985-01-01"
    }
    expected = {
        "id": 1,
        "club_id": 1,
        "book_title": "Monty Python and The Holy Grail",
        "active": "1985-01-01"
    }
    response = client.post("/api/meeting/create", json=meeting)
    app.dependency_overrides = {}

    assert response.status_code == 200
    assert response.json() == expected
