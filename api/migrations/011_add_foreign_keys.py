steps = [
    [
        # "Up" SQL statement
        """
        ALTER TABLE clubs
            ADD CONSTRAINT clubs_owner_id_fkey
            FOREIGN KEY (owner_id)
            REFERENCES users(id)
            ON DELETE RESTRICT;

        ALTER TABLE meetings
            ADD CONSTRAINT meetings_club_id_fkey
            FOREIGN KEY (club_id)
            REFERENCES clubs(club_id)
            ON DELETE CASCADE,
            ADD CONSTRAINT meetings_book_title_fkey
            FOREIGN KEY (book_title)
            REFERENCES books(title)
            ON DELETE RESTRICT;

        ALTER TABLE clubs_members
            ADD CONSTRAINT clubs_members_club_id_fkey
            FOREIGN KEY (club_id)
            REFERENCES clubs(club_id)
            ON DELETE CASCADE,
            ADD CONSTRAINT clubs_members_member_id_fkey
            FOREIGN KEY (member_id)
            REFERENCES users(id)
            ON DELETE CASCADE;

        ALTER TABLE clubs_meetings
            ADD CONSTRAINT clubs_meetings_club_id_fkey
            FOREIGN KEY (club_id)
            REFERENCES clubs(club_id)
            ON DELETE CASCADE,
            ADD CONSTRAINT clubs_meetings_meeting_id_fkey
            FOREIGN KEY (meeting_id)
            REFERENCES meetings(id)
            ON DELETE CASCADE
            NOT VALID;

        ALTER TABLE meetings_attendees
            ADD CONSTRAINT meetings_attendees_meeting_id_fkey
            FOREIGN KEY (meeting_id)
            REFERENCES meetings(id)
            ON DELETE CASCADE,
            ADD CONSTRAINT meetings_attendees_attendee_id_fkey
            FOREIGN KEY (attendee_id)
            REFERENCES users(id)
            ON DELETE CASCADE;

        ALTER TABLE bets
            ADD CONSTRAINT bets_meeting_id_fkey
            FOREIGN KEY (meeting_id)
            REFERENCES meetings(id)
            ON DELETE CASCADE,
            ADD CONSTRAINT bets_better_id_fkey
            FOREIGN KEY (better_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
            ADD CONSTRAINT bets_horse_id_fkey
            FOREIGN KEY (horse_id)
            REFERENCES users(id)
            ON DELETE CASCADE;

        ALTER TABLE friends
            ADD CONSTRAINT friends_member_id_fkey
            FOREIGN KEY (member_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
            ADD CONSTRAINT friends_friend_id_fkey
            FOREIGN KEY (friend_id)
            REFERENCES users(id)
            ON DELETE CASCADE;

        ALTER TABLE request
            ADD CONSTRAINT request_user_id_fkey
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
            ADD CONSTRAINT request_friend_id_fkey
            FOREIGN KEY (friend_id)
            REFERENCES users(id)
            ON DELETE CASCADE;
        """,
        # "Down" SQL statement
        """
        ALTER TABLE request
            DROP CONSTRAINT IF EXISTS request_friend_id_fkey,
            DROP CONSTRAINT IF EXISTS request_user_id_fkey;

        ALTER TABLE friends
            DROP CONSTRAINT IF EXISTS friends_friend_id_fkey,
            DROP CONSTRAINT IF EXISTS friends_member_id_fkey;

        ALTER TABLE bets
            DROP CONSTRAINT IF EXISTS bets_horse_id_fkey,
            DROP CONSTRAINT IF EXISTS bets_better_id_fkey,
            DROP CONSTRAINT IF EXISTS bets_meeting_id_fkey;

        ALTER TABLE meetings_attendees
            DROP CONSTRAINT IF EXISTS meetings_attendees_attendee_id_fkey,
            DROP CONSTRAINT IF EXISTS meetings_attendees_meeting_id_fkey;

        ALTER TABLE clubs_meetings
            DROP CONSTRAINT IF EXISTS clubs_meetings_meeting_id_fkey,
            DROP CONSTRAINT IF EXISTS clubs_meetings_club_id_fkey;

        ALTER TABLE clubs_members
            DROP CONSTRAINT IF EXISTS clubs_members_member_id_fkey,
            DROP CONSTRAINT IF EXISTS clubs_members_club_id_fkey;

        ALTER TABLE meetings
            DROP CONSTRAINT IF EXISTS meetings_book_title_fkey,
            DROP CONSTRAINT IF EXISTS meetings_club_id_fkey;

        ALTER TABLE clubs
            DROP CONSTRAINT IF EXISTS clubs_owner_id_fkey;
        """
    ]
]
