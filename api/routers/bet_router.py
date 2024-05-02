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
      new_bet.amount
    )
    bet_out = Bet(**bet.model_dump())
    return bet_out
