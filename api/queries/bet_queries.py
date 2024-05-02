"""
Database Queries for Bets
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from models.bets import Bet

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

pool = ConnectionPool(DATABASE_URL)


class BetQueries:

    def place_bet(
        self,
        meeting_id: int,
        better_id: int,
        horse_id: int,
        amount: int
    ):
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(Bet)) as cur:
                    cur.execute(
                        """
                        INSERT INTO bets (
                        meeting_id, better_id, horse_id, amount
                        )
                        VALUES (
                        %s, %s, %s, %s
                        )
                        RETURNING meeting_id, better_id, horse_id, amount;
                        """,
                        [meeting_id, better_id, horse_id, amount]
                    )
                    bet = cur.fetchone()
                    if not bet:
                        return None
            return bet
        except psycopg.Error as e:
            print(e)
