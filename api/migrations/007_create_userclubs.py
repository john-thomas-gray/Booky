steps = [
    [
        # "Up" SQL statement
        """
        CREATE TABLE userclubs (
            id INT NOT NULL,
            user_id INT NOT NULL,
            username VARCHAR(100) NOT NULL UNIQUE,
            club_id INT NOT NULL UNIQUE


        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE userclubs;
        """
    ],
    [
        """
        SELECT users.id, users.username, clubs.club_id
        FROM users
        LEFT JOIN userclubs
        ON userclubs.user_id = users.id
        LEFT JOIN clubs
        on userclubs.club_id = clubs.club_id;
        """,
        # "Down" SQL statement
        """
        DROP TABLE userclubs;
        """
    ],

]
