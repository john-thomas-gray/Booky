steps = [
    [
        # "Up" SQL statement
        """
        CREATE TABLE books (
            book_id INT NOT NULL,
            title VARCHAR(100) NOT NULL UNIQUE,
            author VARCHAR(100) NOT NULL UNIQUE,
            page_count INT,
            synopsis VARCHAR(250)
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE books;
        """
    ],
    [
        # "Up" SQL statement
        """
        INSERT INTO books VALUES
            (1, 'Tylers Biography', 'Tyler', 123, 'A book about a chill bro.'),
            (2, 'Judahs Biography', 'Judah', 112, 'A super sick, dope, jiu jitsu master from the east.'),
            (3, 'Vinnys Biography', 'Vinny', 105, 'A book about a young guy from the Sopranos Family.'),
            (4, 'Johns Biography', 'John', 1001, 'A very nice guy, but kinda old lol.');
        """,
        # "Down" SQL statement
        """
        DROP TABLE books;
        """
    ]
]
