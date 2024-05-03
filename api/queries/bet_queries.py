"""
Database Queries for Bets
"""
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
from models.bets import Bet
from typing import Optional, List

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

    def get_bet(self, meeting_id: int, better_id: int) -> Optional[Bet]:
        """
        Gets a bet
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(Bet)) as cur:
                    cur.execute(
                        """
                        SELECT
                        meeting_id, better_id, horse_id, amount
                        FROM bets
                        WHERE meeting_id = %s AND better_id = %s
                        """,
                        [meeting_id, better_id]
                    )
                    page = cur.fetchone()
                    if not page:
                        return None
                    return page
        except psycopg.Error as e:
            print(e)

    def list_bets_by_meeting(self, meeting_id: int) -> Optional[List[Bet]]:
        """
        gets all bets given a meeting id
        """
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=class_row(Bet)) as cur:
                    cur.execute(
                      """
                      SELECT meeting_id, better_id, horse_id, amount
                      FROM bets
                      WHERE meeting_id = %s;
                      """,
                      [meeting_id],
                    )
                    attendees_by_meeting = cur.fetchall()
                return attendees_by_meeting
        except psycopg.Error as e:
            print(e)
