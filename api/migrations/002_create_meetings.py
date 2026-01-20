steps = [
    [
        # create the table
        """
        CREATE TABLE meetings (
            id SERIAL PRIMARY KEY NOT NULL,
            club_id INT NOT NULL,
            book_id INT NOT NULL,
            active DATE NOT NULL
        );
        """,
        """
        DROP TABLE meetings;
        """
    ]

]
