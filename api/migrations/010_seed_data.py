steps = [
    [
        """
        INSERT INTO users VALUES
            (1, 'Tyler99', '123', 'tyler99@mac.com', 1000, 'https://i.natgeofe.com/k/75ac774d-e6c7-44fa-b787-d0e20742f797/'
            'giant-panda-eating_4x3.jpg'),
            (2, 'John93', '123', 'john93@mac.com', 560,
            'https://www.oregonzoo.org/sites/default/files/styles/16x9_fallback/public/2023-08/'
            'H_hippo_0.jpg?h=fbd56c7f&itok=dusljbzS'),
            (3, 'Vinny2010', '123', 'vinny2010@gmail.com', 7777,
            'https://img.freepik.com/free-photo/'
            'view-wild-lion-nature_23-2150460851.jpg?size=626&ext=jpg&ga=GA1.1.553209589.1713916800&semt=ais'),
            (4, 'Judah44', '123', 'judah44@gmail.com', 23000, 'https://t4.ftcdn.net/jpg/'
            '02/40/78/01/240_F_240780187_cgwSIa7p3sHXcKMI4ZyvfbE16Awfckq5.jpg');
        ALTER SEQUENCE users_id_seq RESTART WITH 5;
        """,
        """
        DELETE FROM users WHERE id IN (1, 2, 3, 4);
        ALTER SEQUENCE users_id_seq RESTART WITH 1;
        """,
    ],
    [
        """
        INSERT INTO clubs VALUES
            (1, 1, 'Read This', 'Phoenix', 'AZ', 'USA', 0),
            (2, 2, 'Oprah Book Club', 'Glendale', 'AZ', 'USA', 10000),
            (1, 3, 'Josh Elder Fan Club', 'Tokyo city', 'Tokyo', 'Japan', 1000),
            (2, 4, 'Much Ado About Something', 'Scottsdale', 'AZ', 'USA', 100);
        ALTER SEQUENCE clubs_club_id_seq RESTART WITH 5;
        """,
        """
        DELETE FROM clubs WHERE club_id IN (1, 2, 3, 4);
        ALTER SEQUENCE clubs_club_id_seq RESTART WITH 1;
        """,
    ],
    [
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
        """
        DELETE FROM books WHERE book_id IN (1, 2, 3, 4);
        ALTER SEQUENCE books_book_id_seq RESTART WITH 1;
        """,
    ],
    [
        """
        INSERT INTO meetings VALUES
            (1, 1, 1, '2024-01-01'),
            (2, 2, 2, '2024-06-06'),
            (3, 3, 3, '2024-07-07'),
            (4, 3, 4, '2023-01-01');
        ALTER SEQUENCE meetings_id_seq RESTART WITH 5;
        """,
        """
        DELETE FROM meetings WHERE id IN (1, 2, 3, 4);
        ALTER SEQUENCE meetings_id_seq RESTART WITH 1;
        """,
    ],
    [
        """
        INSERT INTO clubs_members (club_id, member_id) VALUES
            (1, 1),
            (1, 2),
            (2, 1),
            (2, 2),
            (2, 3),
            (2, 4),
            (3, 1),
            (3, 3),
            (4, 1),
            (4, 4)
        """,
        """
        DELETE FROM clubs_members WHERE club_id IN (1, 2, 3, 4);
        """,
    ],
    [
        """
        INSERT INTO meetings_attendees (meeting_id, attendee_id, attendee_page, place_at_last_finish, finished) VALUES
            (1, 1, 10, 7, false),
            (1, 2, 11, 2, false),
            (2, 1, 55, 1, true),
            (2, 2, 100, 2, false),
            (2, 3, 0, 11, false),
            (2, 4, 12, 7, false)

        """,
        """
        DELETE FROM meetings_attendees WHERE meeting_id IN (1, 2, 3, 4);
        """,
    ],
    [
        """
        INSERT INTO clubs_meetings (club_id, meeting_id) VALUES
            (1, 1),
            (1, 2),
            (2, 3),
            (2, 4)

        """,
        """
        DELETE FROM clubs_meetings WHERE club_id IN (1, 2, 3, 4);
        """,
    ],
    [
        """
        INSERT INTO friendships (user_id, friend_id, status, requested_by) VALUES
            (1, 2, 'accepted', 1),
            (1, 4, 'accepted', 4),
            (2, 3, 'accepted', 2)
        """,
        """
        DELETE FROM friendships
        WHERE (user_id, friend_id) IN ((1, 2), (1, 4), (2, 3));
        """,
    ],
    [
        """
        INSERT INTO friendships (user_id, friend_id, status, requested_by) VALUES
            (1, 3, 'pending', 3),
            (2, 4, 'pending', 4)
        """,
        """
        DELETE FROM friendships
        WHERE (user_id, friend_id) IN ((1, 3), (2, 4));
        """,
    ],
]
