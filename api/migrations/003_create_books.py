steps = [
    [
        ##create the table
        """
        CREATE TABLE books (
            book_id SERIAL NOT NULL,
            title VARCHAR(100) PRIMARY KEY NOT NULL,
            author VARCHAR(100) NOT NULL,
            page_count INT NOT NULL,
            genre VARCHAR(100) NOT NULL,
            synopsis TEXT,
            cover_img_url VARCHAR(300)

        );
        """,
        """
        DROP TABLE meetings;
        """
    ],
    [
        # "Up" SQL statement
        """
        INSERT INTO books VALUES
            (1, 'Pride and Prejudice', 'Jane Austen', 250, 'Romance', 'A true banger.',
            'https://m.media-amazon.com/images/I/91FldvTHNvL._AC_UF1000,1000_QL80_.jpg'),
            (2, 'Great Expectations', 'Charles Dickens', 500, 'Hack Reactor', 'Juicy fan fic.',
            'https://images.booksense.com/images/132/726/9781532726132.jpg'),
            (3, 'Dune', 'Frank Herbert', 1300, 'Seuss Books', 'I do not like green eggs and ham.',
            'https://images.booksense.com/images/719/172/9780441172719.jpg'),
            (4, 'The Bell Jar', 'Sylvia Plath', 345, 'Novel', 'Very sad.',
            'https://t4.ftcdn.net/jpg/02/40/78/01/240_F_240780187_cgwSIa7p3sHXcKMI4ZyvfbE16Awfckq5.jpg');
        ALTER SEQUENCE books_book_id_seq RESTART WITH 5;
        """,
        # "Down" SQL statement
        """
        DROP TABLE books
        """
    ]
]
