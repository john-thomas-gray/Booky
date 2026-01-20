steps = [
    [
        """
        CREATE TABLE friendships (
            user_id INT NOT NULL
                REFERENCES users(id)
                ON DELETE CASCADE,
            friend_id INT NOT NULL
                REFERENCES users(id)
                ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            requested_by INT NOT NULL
                REFERENCES users(id)
                ON DELETE CASCADE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            PRIMARY KEY (user_id, friend_id),
            CHECK (user_id < friend_id),
            CHECK (requested_by = user_id OR requested_by = friend_id)
        );
        """,
        """
        DROP TABLE friendships;
        """
    ]
]
