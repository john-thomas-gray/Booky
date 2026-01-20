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

        ALTER TABLE clubs
            ADD CONSTRAINT clubs_owner_id_fkey
            FOREIGN KEY (owner_id)
            REFERENCES users(id)
            ON DELETE RESTRICT;

        ALTER TABLE meetings
            ADD CONSTRAINT meetings_club_id_fkey
            FOREIGN KEY (club_id)
            REFERENCES clubs(club_id)
            ON DELETE CASCADE;
        """,
        # "Down" SQL statement
        """
        ALTER TABLE meetings
            DROP CONSTRAINT IF EXISTS meetings_club_id_fkey;

        ALTER TABLE clubs
            DROP CONSTRAINT IF EXISTS clubs_owner_id_fkey;

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
]
