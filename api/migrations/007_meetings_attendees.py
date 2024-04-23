steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE meetings_attendees (
          meeting_id INT NOT NULL,
          attendee_id INT NOT NULL,
          PRIMARY KEY (meeting_id, attendee_id)
      );
      """,
      # "Down" SQL statement
      """
      DROP TABLE meetings_attendees;
      """
  ],
  [
      # "Up" SQL statement
      """
      INSERT INTO meetings_attendees (meeting_id, attendee_id) VALUES
          (1, 1),
          (1, 2),
          (2, 1),
          (2, 2),
          (2, 3),
          (2, 4),
          (3, 1),
          (3, 3),
          (4, 1),
          (4, 4);
      """,
      # "Down" SQL statement
      """
      DELETE FROM meetings_attendees WHERE meeting_id IN (1, 2, 3, 4);
      """
  ]
]
