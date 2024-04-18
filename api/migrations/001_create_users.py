steps = [
    [
        # "Up" SQL statement
        """
        CREATE TABLE users (
            id SERIAL PRIMARY KEY NOT NULL,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(256) NOT NULL,
            email VARCHAR(100) NOT NULL,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            avatar_url VARCHAR(300),
            bio VARCHAR(500)
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
            (1, 'Tyler99', '123', 'primaveradvm@gmail.com', 'Tyler', 'Primavera', '', 'A very nice guy.'),
            (2, 'John93', '123', 'johnthomasgray1@gmail.com', 'John', 'Gray', '', 'A very old guy.'),
            (3, 'Vinny2010', '123', 'vvitiritto@yahoo.com', 'Vinny', 'Vitiritto', '', 'A very mean guy.'),
            (4, 'Judah44', '123', 'jmlv01@icloud.com', 'Judah', 'Viggers', '', 'A very young guy.');
        """,
        # "Down" SQL statement
        """
        DROP TABLE users;
        """
    ]
]
