steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE bets (
          meeting_id INT NOT NULL
              REFERENCES meetings(id)
              ON DELETE CASCADE,
          better_id INT NOT NULL
              REFERENCES users(id)
              ON DELETE CASCADE,
          horse_id INT NOT NULL
              REFERENCES users(id)
              ON DELETE CASCADE,
          amount INT NOT NULL,
          paid BOOL DEFAULT false,
          PRIMARY KEY (meeting_id, better_id)
      );
      """,
      # "Down" SQL statement
      """
      DROP TABLE bets;
      """
  ]
]
