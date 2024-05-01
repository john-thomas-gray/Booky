steps = [
    [
        # "Up" SQL statement
        """
        CREATE TABLE clubs (
            owner_id INT NOT NULL,
            club_id SERIAL PRIMARY KEY NOT NULL,
            name VARCHAR(50) NOT NULL,
            city VARCHAR(50),
            state VARCHAR(50),
            country VARCHAR(50),
            score int DEFAULT 0

        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE clubs;
        """
    ],
    [
        """
        SELECT * FROM users
        LEFT JOIN clubs on clubs.owner_id = users.id;



        """,

        """
        DROP TABLE clubs;
        """
    ],
    [
        """
        INSERT INTO clubs VALUES
            (1,1, 'Read This', 'Phoenix', 'AZ', 'USA', 0),
            (2,2, 'Smoke Read Everyday', 'Glendale', 'AZ', 'USA', 10000),
            (1,3, 'Shakespeare Sucks', 'Tokyo city', 'Tokyo', 'Japan', 1000),
            (2,4, 'Much Ado About Something', 'Scottsdale', 'AZ', 'USA', 100);
        ALTER SEQUENCE clubs_club_id_seq RESTART WITH 5;
        """,

        """
        DROP TABLE clubs;
        """
    ],
]
