steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE clubs_members (
          club_id INT NOT NULL
              REFERENCES clubs(club_id)
              ON DELETE CASCADE,
          member_id INT NOT NULL
              REFERENCES users(id)
              ON DELETE CASCADE,
          PRIMARY KEY (club_id, member_id)
      );
      """,
      # "Down" SQL statement
      """
      DROP TABLE clubs_members;
      """
  ]
]
