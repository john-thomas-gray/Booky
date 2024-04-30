steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE bets (
            better_id INT NOT NULL,
            horse_id INT NOT NULL,
            point_amount INT NOT NULL,
          PRIMARY KEY (better_id, horse_id, point_amount)
      );
      """,
      # "Down" SQL statement
      """
      DROP TABLE bets;
      """
  ]
]
