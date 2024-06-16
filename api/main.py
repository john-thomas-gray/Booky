"""
Entry point for the FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    auth_router, club_router, meeting_router, book_router, user_router, user_club_router, bet_router, attendee_router,
    friend_router, friend_request_router)
# import os

app = FastAPI()

allowed_origins = ["https://bookingforbooky.com", "https://booky7.gitlab.io"]

app.add_middleware(
    CORSMiddleware,
    # allow_origins=[os.environ.get("CORS_HOST", "http://localhost:5173")],
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(club_router.router)
app.include_router(meeting_router.router)
app.include_router(book_router.router)
app.include_router(attendee_router.router)
app.include_router(user_club_router.router)
app.include_router(bet_router.router)
app.include_router(friend_router.router)
app.include_router(friend_request_router.router)


@app.get("/api/launch-details")
def launch_details():
    return {
        "launch_details": {
            "module": 3,
            "week": 17,
            "day": 5,
            "hour": 19,
            "min": "00"
        }
    }
