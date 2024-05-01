steps = [
    [
        ##create the table
        """
        CREATE TABLE meetings (
            id SERIAL PRIMARY KEY NOT NULL,
            club_id INT NOT NULL,
            book_title VARCHAR(100) NOT NULL,
            active DATE NOT NULL
        );
        """,
        """
        DROP TABLE meetings;
        """
    ],
    [
        # "Up" SQL statement
        """
        INSERT INTO meetings VALUES
            (1, 1, 'pride and prejudice', '2024-01-01'),
            (2, 2, 'Django documentation part 9', '2024-06-06'),
            (3, 3, 'dr. seuss', '2024-07-07'),
            (4, 3, 'The Bell Jar', '2023-01-01');
        ALTER SEQUENCE meetings_id_seq RESTART WITH 5;
        """,
        # "Down" SQL statement
        """
        DROP TABLE meetings;
        """
    ]

]
