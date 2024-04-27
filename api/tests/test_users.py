from main import app
from fastapi.testclient import TestClient
from queries.user_queries import UserQueries
from pydantic import BaseModel
from models.users import UserWithPw
from utils.authentication import try_get_jwt_user_data

client = TestClient(app)

class EmptyUserQueries:
  def list_users(self):
    return []

class CreateUserQueries:
  def create_user(self, username, password, email, score, picture_url):
    user = UserWithPw(
            id=1,
            username=username,
            password=password,
            email=email,
            score=score,
            picture_url=picture_url
        )
    return user


def test_get_all_users():
  app.dependency_overrides[UserQueries] = EmptyUserQueries

  response = client.get("/api/users/")

  app.dependency_overrides = {}

  assert response.status_code == 200
  assert response.json() == []

def test_create_user():
  app.dependency_overrides[UserQueries] = CreateUserQueries
  json = {
    "id": 0,
    "username": "stringing",
    "password": "string",
    "email": "string",
    "score": 0,
    "picture_url": "string"
  }
  expected = {
    "id": 1,
    "username": "stringing",
    "password": "string",
    "email": "string",
    "score": 0,
    "picture_url": "string"
  }

  response = client.post("/api/users/", json=json)

  app.dependency_overrides = {}

  assert response.status_code == 200
  assert response.json() == expected
