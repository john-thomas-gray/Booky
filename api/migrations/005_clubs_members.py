steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE clubs_members (
          club_id INT NOT NULL,
          member_id INT NOT NULL,
          PRIMARY KEY (club_id, member_id)
      );
      """,
      # "Down" SQL statement
      """
      DROP TABLE clubs_members;
      """
  ],
  [
      # "Up" SQL statement
      """
      INSERT INTO clubs_members (club_id, member_id) VALUES
          (1, 1),
          (1, 2),
          (2, 1),
          (2, 2),
          (2, 3),
          (2, 4),
          (3, 1),
          (3, 3),
          (4, 1),
          (4, 4)
      """,
      # "Down" SQL statement
      """
      DELETE FROM clubs_members WHERE club_id IN (1, 2, 3, 4);
      """
  ]
]
