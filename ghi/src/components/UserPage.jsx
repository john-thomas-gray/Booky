/* eslint-disable react/no-unescaped-entities */
import useAuthService from '../hooks/useAuthService'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { NavLink, Link } from 'react-router-dom'
import { API_HOST } from '../config'

export default function UserPage() {
    const { pageOwnerID } = useParams()
    const [pageOwner, setPageOwner] = useState([])
    const [clubs, setClubs] = useState([])
    const [meetings, setMeetings] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const { user } = useAuthService()
    const [friends, setFriends] = useState([])
    const [requests, setRequests] = useState([])

    const handleRemoveFriend = async (val) => {
        removeFriend(val)
        removeOtherFriend(val)
    }

    const fetchRequests = async () => {
        const url = `${API_HOST}/api/friend/requests`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setRequests(data.filter((request) => request.user_id == user.id))
        }
    }
    const removeFriend = async (val) => {
        const url = `${API_HOST}/api/friend/${user.id}/${val}`
        const fetchOptions = {
            method: 'delete',
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }
        const response = await fetch(url, fetchOptions)
        if (response.ok) {
            fetchFriends()
        }
    }
    const removeOtherFriend = async (val) => {
        const url = `${API_HOST}/api/friend/${val}/${user.id}`
        const fetchOptions = {
            method: 'delete',
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }
        const response = await fetch(url, fetchOptions)
        if (response.ok) {
            fetchFriends()
        }
    }

    const fetchPageOwnerData = async () => {
        const url = `${API_HOST}/api/users/${pageOwnerID}`
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setPageOwner(data)
        }
    }

    const fetchClubData = async () => {
        const url = `${API_HOST}/api/clubs/user/${pageOwnerID}`
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setClubs(data)
            console.log('clubs: ', clubs)
        }
    }

    const fetchMeetingData = async () => {
        const url = `${API_HOST}/api/meeting/${pageOwnerID}/user`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setMeetings(data)
        }
    }

    const fetchFriends = async () => {
        const url = `${API_HOST}/api/${pageOwnerID}/friends`
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setFriends(data)
        } else {
            setFriends([])
        }
    }

    useEffect(() => {
        fetchPageOwnerData()
        fetchClubData()
        fetchMeetingData()
        fetchFriends()
        fetchRequests()
    }, [])

    const currentMeetings = meetings.filter(
        (meeting) => new Date(meeting.active) > new Date()
    )
    const pastMeetings = meetings.filter(
        (meeting) => new Date(meeting.active) < new Date()
    )

    const handleNextMeeting = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % currentMeetings.length)
    }

    const handlePrevMeeting = () => {
        setCurrentIndex(
            (prevIndex) =>
                (prevIndex - 1 + currentMeetings.length) %
                currentMeetings.length
        )
    }

    return (
        <main className="user-page">
            <div className="user-page__grid">
                <aside className="user-page__sidebar">
                    <div className="user-card user-profile">
                        <img
                            src={pageOwner.picture_url}
                            alt="User avatar"
                            className="user-avatar"
                        />
                        <div className="user-name">{pageOwner.username}</div>
                    </div>
                    <div className="user-card user-bio">
                        <h4>Bio</h4>
                        <p>{pageOwner.bio || 'No bio yet.'}</p>
                    </div>
                    <div className="user-card user-friends">
                        {user && user.id == pageOwnerID && (
                            <Link
                                to={'/requests'}
                                exact="true"
                                className="link"
                            >
                                Friend Requests ({requests.length})
                            </Link>
                        )}
                        <h4>Friends</h4>
                        {friends.length > 0 ? (
                            <ul className="user-list">
                                {friends.map((friend) => (
                                    <li
                                        key={friend.friend_id}
                                        className="user-list__item"
                                    >
                                        <span>
                                            {friend.friend_username ||
                                                friend.username ||
                                                `User ${friend.friend_id}`}
                                        </span>
                                        {user && user.id == pageOwnerID && (
                                            <button
                                                className="user-action"
                                                onClick={() =>
                                                    handleRemoveFriend(
                                                        friend.friend_id
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="user-muted">No friends yet.</div>
                        )}
                    </div>
                </aside>

                <section className="user-page__center">
                    <div className="user-score">
                        Score: {pageOwner.score}
                    </div>
                    <div className="user-card">
                        <h3>Books you've read</h3>
                        {pastMeetings.length > 0 ? (
                            <ul className="user-list">
                                {pastMeetings.map((meeting) => (
                                    <li
                                        key={meeting.id}
                                        className="user-list__item"
                                    >
                                        <a
                                            href={`/meetings/${meeting.id}`}
                                            className="link"
                                        >
                                            {meeting.book_title}
                                        </a>
                                        <span className="user-muted">
                                            {meeting.active}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="user-muted">No books yet.</div>
                        )}
                    </div>
                    <div className="user-card">
                        <h3>Upcoming meetings</h3>
                        {currentMeetings.length > 0 ? (
                            <>
                                <a
                                    href={`/meetings/${currentMeetings[currentIndex].id}`}
                                    className="meeting-card"
                                >
                                    <div className="meeting-title">
                                        {currentMeetings[currentIndex].book_title}
                                    </div>
                                    <div className="user-muted">
                                        {currentMeetings[currentIndex].active}
                                    </div>
                                </a>
                                <div className="meeting-actions">
                                    <button
                                        className="user-action"
                                        onClick={handlePrevMeeting}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className="user-action"
                                        onClick={handleNextMeeting}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="user-muted">
                                No meetings scheduled.
                            </div>
                        )}
                    </div>
                </section>

                <aside className="user-page__aside">
                    <div className="user-card">
                        <h4>Clubs</h4>
                        {clubs.length > 0 &&
                        user.id === Number(pageOwnerID) ? (
                            <ul className="user-list">
                                {clubs.map((club) => (
                                    <li
                                        key={club.club_id}
                                        className="user-list__item"
                                    >
                                        <NavLink
                                            to={`/clubs/${club.club_id}`}
                                            className="link"
                                        >
                                            {club.name}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="user-muted">
                                No clubs yet.
                                <div className="user-inline-links">
                                    <NavLink to="/clubs/list" className="link">
                                        Join a club
                                    </NavLink>
                                    <span> or </span>
                                    <NavLink to="/clubs" className="link">
                                        create your own
                                    </NavLink>
                                    <span>.</span>
                                </div>
                            </div>
                        )}
                    </div>
                    {user && user.id === Number(pageOwnerID) && (
                        <div className="user-card user-actions">
                            <NavLink to="/clubs" className="user-primary">
                                Create a club
                            </NavLink>
                            <NavLink
                                to="/requests"
                                className="user-secondary"
                            >
                                Friend requests ({requests.length})
                            </NavLink>
                        </div>
                    )}
                </aside>
            </div>
        </main>
    )
}
