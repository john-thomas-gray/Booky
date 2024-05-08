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
            (1, 'pride and prejudice', 'Jane Austen', 250, 'Romance', 'A true banger.',
            'https://i.natgeofe.com/k/75ac774d-e6c7-44fa-b787-d0e20742f797/giant-panda-eating_4x3.jpg'),
            (2, 'Django documentation part 9', 'Josh Elder', 5000, 'Hack Reactor', 'Juicy fan fic.',
            'https://www.oregonzoo.org/sites/default/files/styles/16x9_fallback/public/2023-08/H_hippo_0.jpg?h=fbd56c7f&itok=dusljbzS'),
            (3, 'dr. seuss', 'Dr. Seuss', 13, 'Seuss Books', 'I do not like green eggs and ham.',
            'https://img.freepik.com/free-photo/view-wild-lion-nature_23-2150460851.jpg?size=626&ext=jpg&ga=GA1.1.553209589.1713916800&semt=ais'),
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
