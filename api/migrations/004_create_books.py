steps = [
    [
        """
        CREATE TABLE books (
            book_id SERIAL NOT NULL PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            author VARCHAR(100) NOT NULL,
            page_count INT NOT NULL,
            genre VARCHAR(100) NOT NULL,
            synopsis TEXT,
            cover_img_url VARCHAR(300)

        );

        ALTER TABLE meetings
            ADD CONSTRAINT meetings_book_id_fkey
            FOREIGN KEY (book_id)
            REFERENCES books(book_id)
            ON DELETE RESTRICT;
        """,
        """
        ALTER TABLE meetings
            DROP CONSTRAINT IF EXISTS meetings_book_id_fkey;

        DROP TABLE books;
        """
    ]
]
