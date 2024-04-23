steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE clubs_meetings (
          club_id INT NOT NULL,
          meeting_id INT NOT NULL,
          PRIMARY KEY (club_id, meeting_id)
      );
      """,
      # "Down" SQL statement
      """
      DROP TABLE clubs_meetings;
      """
  ],
  [
      # "Up" SQL statement
      """
      INSERT INTO clubs_meetings (club_id, meeting_id) VALUES
          (1, 1),
          (1, 2),
          (2, 3),
          (2, 4),
          (2, 5),
          (2, 6),
          (3, 7),
          (3, 8),
          (4, 9),
          (4, 10);
      """,
      # "Down" SQL statement
      """
      DELETE FROM clubs_meetings WHERE club_id IN (1, 2, 3, 4);
      """
  ]
]
