steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE friends (
          member_id INT NOT NULL,
          friend_id INT NOT NULL,
          PRIMARY KEY (member_id, friend_id)
      );
      """,
      # "Down" SQL statement
      """
      DROP TABLE friends;
      """
  ],
  [
        """
        INSERT INTO friends VALUES
            (1, 2)

        """,

        """
        DROP TABLE friends;
        """
  ]
]
