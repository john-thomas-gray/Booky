steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE meetings_attendees (
          meeting_id INT NOT NULL,
          attendee_id INT NOT NULL,
          attendee_page INT DEFAULT 0,
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
      INSERT INTO meetings_attendees (meeting_id, attendee_id, attendee_page) VALUES
          (1, 1, 10),
          (1, 2, 11),
          (2, 1, 55),
          (2, 2, 100),
          (2, 3, 0)

      """,
      # "Down" SQL statement
      """
      DELETE FROM meetings_attendees WHERE meeting_id IN (1, 2, 3, 4);
      """
  ]
]
