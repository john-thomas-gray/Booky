import useAuthService from '../hooks/useAuthService'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { NavLink } from 'react-router-dom';

export default function UserPage() {
    const { pageOwnerID } = useParams();
    const [pageOwner, setPageOwner] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { user } = useAuthService();

    const fetchPageOwnerData = async () => {
        const url = `http://localhost:8000/api/users/${pageOwnerID}`
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setPageOwner(data)
        }
    };

    const fetchClubData = async () => {
        const url = `http://localhost:8000/api/clubs/user/${pageOwnerID}`
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setClubs(data)
        }
    };

    const fetchMeetingData = async() => {
      const url = `http://localhost:8000/api/meeting/${pageOwnerID}/user`
      const response = await fetch(url, {credentials: "include"})
      if (response.ok) {
        const data = await response.json()
        setMeetings(data)
      }
    };

    useEffect(() => {
        fetchPageOwnerData()
        fetchClubData()
        fetchMeetingData()
    }, [pageOwnerID]);

    const currentMeetings = meetings.filter(
            (meeting) => new Date(meeting.active) > new Date()
        )

    const handleNextMeeting = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % currentMeetings.length)
    };


    const handlePrevMeeting = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + currentMeetings.length) % currentMeetings.length);
    };


    return (
        <>
            <div>
                <div class="userInfo">
                    <img
                        src={pageOwner.picture_url}
                        alt="User avatar"
                        style={{
                            maxWidth: '250px',
                            maxHeight: '250px',
                        }}
                    />
                    <div>{pageOwner.username}</div>
                    <div>{pageOwner.email}</div>
                </div>
            </div>
            <div class="scoreDisplay">
                <div>SCORE: {pageOwner.score}</div>
            </div>
            {user.id == pageOwnerID && (
                <div class="create_club">
                    <nav className="navbar navbar-expand-lg navbar-light bg-light">
                        <div className="container-fluid">
                            <NavLink
                                aria-current="page"
                                to="/clubs"
                                exact="true"
                                className="link"
                            >
                                Create Club
                            </NavLink>
                        </div>
                    </nav>
                </div>
            )}

            <div className="clubList">
                <h2>{pageOwner.username}'s Clubs</h2>
                {clubs.length > 0 ? (
                    <list>
                        {clubs.map((club) => (
                            <NavLink
                                to={`/clubs/${club.club_id}`}
                                className="link"
                            >
                                {club.name}
                            </NavLink>
                        ))}
                    </list>
                ) : (
                    <div>
                        No clubs...
                        <div>
                            <NavLink to="/clubs/list" className="link">
                                Join a club
                            </NavLink>{' '}
                            or{' '}
                            <NavLink to="/clubs" className="link">
                                create your own!
                            </NavLink>
                        </div>
                    </div>
                )}
            </div>

            <div className="pastMeetings">
                <h2>Past Meetings</h2>
                {meetings.some(
                    (meeting) => new Date(meeting.active) < new Date()
                ) ? (
                    <list>
                        {meetings.map((meeting) => {
                            if (new Date(meeting.active) < new Date()) {
                                return (
                                    <div>
                                        <a
                                            href={`/meetings/${meeting.meeting_id}`}
                                        >
                                            {meeting.book_title}{' '}
                                            {meeting.active}
                                        </a>
                                    </div>
                                )
                            }
                        })}
                    </list>
                ) : (
                    <div>No past meetings...</div>
                )}
            </div>

            <div className="currentMeetings">
                <h2>Current Meetings</h2>
                {currentMeetings.length > 0 ? (
                    <>
                        <div>
                            <div>
                                {currentMeetings[currentIndex].book_title}
                            </div>
                            <div>{currentMeetings[currentIndex].active}</div>
                        </div>
                        <div>
                            <button onClick={handlePrevMeeting}>
                                Previous
                            </button>
                            <button onClick={handleNextMeeting}>Next</button>
                        </div>
                    </>
                ) : (
                    <div>No meetings scheduled...</div>
                )}
            </div>
        </>
    )
}
