steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE clubs_meetings (
          club_id INT NOT NULL
              REFERENCES clubs(club_id)
              ON DELETE CASCADE,
          meeting_id INT NOT NULL
              REFERENCES meetings(id)
              ON DELETE CASCADE,
          PRIMARY KEY (club_id, meeting_id)
      );
      """,
      # "Down" SQL statement
      """
      DROP TABLE clubs_meetings;
      """
  ]
]
