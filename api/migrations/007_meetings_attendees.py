# Could rename this table to simply attendees, since meeting_id is
# just an attribute of an attendee

steps = [
  [
      # "Up" SQL statement
      """
      CREATE TABLE meetings_attendees (
          meeting_id INT NOT NULL
              REFERENCES meetings(id)
              ON DELETE CASCADE,
          attendee_id INT NOT NULL
              REFERENCES users(id)
              ON DELETE CASCADE,
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
  ]
]
