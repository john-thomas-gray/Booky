steps = [
    [
        # "Up" SQL statement
        """
        CREATE TABLE users (
            id SERIAL PRIMARY KEY NOT NULL,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(256) NOT NULL,
            email VARCHAR(100) UNIQUE,
            score INT DEFAULT 0,
            picture_url VARCHAR(256)
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE users;
        """
    ]
]
