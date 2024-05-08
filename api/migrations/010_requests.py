steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE request (
          user_id INT NOT NULL,
          friend_id INT NOT NULL,
          friend_name VARCHAR(100) NOT NULL,
          approved BOOL default false,
          PRIMARY KEY (user_id, friend_id)
      );
      """,
      # "Down" SQL statement
      """
      DROP TABLE request;
      """
  ],
  [
        """
        INSERT INTO request VALUES
            (1, 2, 'John93')

        """,

        """
        DROP TABLE friends;
        """
  ]
]
