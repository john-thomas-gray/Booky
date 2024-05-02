# Could rename this table to simply attendees, since meeting_id is
# just an attribute of an attendee

steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE meetings_attendees (
          meeting_id INT NOT NULL,
          attendee_id INT NOT NULL,
          attendee_page INT DEFAULT 0,
          place_at_last_finish INT DEFAULT 0,
          finished BOOL DEFAULT false,
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
      INSERT INTO meetings_attendees (meeting_id, attendee_id, attendee_page, place_at_last_finish, finished) VALUES
          (1, 1, 10, 7, false),
          (1, 2, 11, 2, false),
          (2, 1, 55, 1, true),
          (2, 2, 100, 2, false),
          (2, 3, 0, 11, false),
          (2, 4, 12, 7, false)

      """,
      # "Down" SQL statement
      """
      DELETE FROM meetings_attendees WHERE meeting_id IN (1, 2, 3, 4);
      """
  ]
]
