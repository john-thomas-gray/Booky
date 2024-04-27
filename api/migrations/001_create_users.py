steps = [
    [
        # "Up" SQL statement
        """
        CREATE TABLE users (
            id SERIAL PRIMARY KEY NOT NULL,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(256) NOT NULL,
            email VARCHAR(100),
            score INT DEFAULT 0,
            picture_url VARCHAR(256)
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
            (1, 'Tyler99', '123', 'blah@blah.com', 1000, 'https://i.natgeofe.com/k/75ac774d-e6c7-44fa-b787-d0e20742f797/giant-panda-eating_4x3.jpg'),
            (2, 'John93', '123', 'blah@blah.com', 560, 'https://www.oregonzoo.org/sites/default/files/styles/16x9_fallback/public/2023-08/H_hippo_0.jpg?h=fbd56c7f&itok=dusljbzS'),
            (3, 'Vinny2010', '123', 'blah@blah.com', 7777, 'https://img.freepik.com/free-photo/view-wild-lion-nature_23-2150460851.jpg?size=626&ext=jpg&ga=GA1.1.553209589.1713916800&semt=ais'),
            (4, 'Judah44', '123', 'blah@blah.com', 23000, 'https://t4.ftcdn.net/jpg/02/40/78/01/240_F_240780187_cgwSIa7p3sHXcKMI4ZyvfbE16Awfckq5.jpg');
        ALTER SEQUENCE users_id_seq RESTART WITH 5;
        """,
        # "Down" SQL statement
        """
        TRUNCATE TABLE users; -- clear all data from the users table
        ALTER SEQUENCE users_id_seq RESTART WITH 1; -- reset the sequence to start at 1 again
        """
    ]
]
