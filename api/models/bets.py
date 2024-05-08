"""
Pydantic Models for Bets.
"""
from pydantic import BaseModel


class Bet(BaseModel):
    """
    Model to place a bet
    """
    meeting_id: int
    better_id: int
    horse_id: int
    amount: int
    paid: bool
