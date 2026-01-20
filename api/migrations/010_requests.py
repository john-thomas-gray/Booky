steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE request (
          user_id INT NOT NULL
              REFERENCES users(id)
              ON DELETE CASCADE,
          friend_id INT NOT NULL
              REFERENCES users(id)
              ON DELETE CASCADE,
          approved BOOL default false,
          PRIMARY KEY (user_id, friend_id)
      );
      """,
      # "Down" SQL statement
      """
      DROP TABLE request;
      """
  ]
]
