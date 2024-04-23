steps = [
    [
        ##create the table
        """
        CREATE TABLE meetings (
            id SERIAL PRIMARY KEY NOT NULL,
            club_id INT NOT NULL,
            club_name VARCHAR(100) NOT NULL,
            club_score INT NOT NULL,
            book_title VARCHAR(100) NOT NULL,
            total_pages INT,
            current_page INT,
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
            (1, 1, 'Bookclub', 1000, 'pride and prejudice', 300, 0, '2024-01-01'),
            (2, 2, 'Oprahs Club', 2300, 'Django documentation part 9', 3000, 0, '2024-01-01'),
            (3, 3, 'Illiterate', 10, 'dr. seuss', 10, 0, '2024-01-01'),
            (4, 3, 'Sad Lady Time', 10000, 'The Bell Jar', 450, 0, '2024-01-01');
        ALTER SEQUENCE meetings_id_seq RESTART WITH 5;
        """,
        # "Down" SQL statement
        """
        DROP TABLE meetings;
        """
    ]

]
