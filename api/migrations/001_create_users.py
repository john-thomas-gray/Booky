steps = [
    [
        # "Up" SQL statement
        """
        CREATE TABLE users (
            id SERIAL PRIMARY KEY NOT NULL,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(256) NOT NULL

        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE users;
        """
    ],
    [
        # "Up" SQL statement
        """
        INSERT INTO users VALUES
            (1, 'Tyler99', '123'),
            (2, 'John93', '123'),
            (3, 'Vinny2010', '123'),
            (4, 'Judah44', '123');
        ALTER SEQUENCE users_id_seq RESTART WITH 5;
        """,
        # "Down" SQL statement
        """
        TRUNCATE TABLE users; -- clear all data from the users table
        ALTER SEQUENCE users_id_seq RESTART WITH 1; -- reset the sequence to start at 1 again
        """
    ]
]


            # email VARCHAR(100) NOT NULL,
            # first_name VARCHAR(50),
            # last_name VARCHAR(50),
            # avatar_url VARCHAR(300),
            # bio VARCHAR(500)
