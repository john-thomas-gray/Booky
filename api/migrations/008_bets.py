steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE bets (
          meeting_id INT NOT NULL,
          better_id INT NOT NULL,
          horse_id INT NOT NULL,
          amount INT NOT NULL,
          finished_count INT DEFAULT 0,
          PRIMARY KEY (meeting_id, better_id)
      );
      """,
      # "Down" SQL statement
      """
      DROP TABLE bets;
      """
  ]
]
