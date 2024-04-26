steps = [
    [
        ##create the table
        """
        CREATE TABLE books (
            book_id SERIAL PRIMARY KEY NOT NULL,
            title VARCHAR(100) NOT NULL,
            author VARCHAR(100) NOT NULL,
            page_count INT NOT NULL,
            genre VARCHAR(100) NOT NULL,
            publisher VARCHAR(100) NOT NULL,
            synopsis TEXT,
            cover_img_url VARCHAR(100)
        );
        """,
        """
        DROP TABLE meetings;
        """
    ],
    # [
    #     # "Up" SQL statement
    #     """
    #     INSERT INTO books VALUES
    #         (1, 'Much Ado About Nothing', 'me', 100,'mystery', 'me', 'synopsis', 'dummyurl'),

    #     """,
    #     # "Down" SQL statement
    #     """
    #     DROP TABLE meetings;
    #     """
    # ]

]
