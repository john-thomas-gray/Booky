"""
Bet API Router
"""
from fastapi import (
    Depends,
    Response,
    APIRouter,
)
from queries.bet_queries import (
  BetQueries,
)
from models.bets import Bet
from typing import List

router = APIRouter(tags=["Bets"], prefix="/api/bets")


@router.post("/place")
async def place_bet(
    response: Response,
    new_bet: Bet,
    queries: BetQueries = Depends()
) -> Bet:
    bet = queries.place_bet(
      new_bet.meeting_id,
      new_bet.better_id,
      new_bet.horse_id,
      new_bet.amount,
      new_bet.paid
    )
    bet_out = Bet(**bet.model_dump())
    return bet_out


@router.get("/")
def get_bet(
    meeting_id: int,
    better_id: int,
    queries: BetQueries = Depends(),
) -> Bet:
    bet_response = queries.get_bet(
        meeting_id,
        better_id,
    )
    return bet_response


@router.get("/{meeting_id}")
def list_bets_by_meeting(
    meeting_id: int,
    response: Response,
    queries: BetQueries = Depends(),
) -> List[Bet]:
    bets = queries.list_bets_by_meeting(meeting_id)
    if bets is None:
        response.status_code = 404
    return bets
