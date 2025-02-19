/* eslint-disable react/no-unescaped-entities */
import useAuthService from '../hooks/useAuthService'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { NavLink, Link } from 'react-router-dom'

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
        const url = 'https://bookingforbooky.com/api/friend/requests'
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setRequests(data.filter((request) => request.user_id == user.id))
        }
    }
    const removeFriend = async (val) => {
        const url = `https://bookingforbooky.com/api/friend/${user.id}/${val}`
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
        const url = `https://bookingforbooky.com/api/friend/${val}/${user.id}`
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
        const url = `https://bookingforbooky.com/api/users/${pageOwnerID}`
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setPageOwner(data)
        }
    }

    const fetchClubData = async () => {
        const url = `https://bookingforbooky.com/api/clubs/user/${pageOwnerID}`
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setClubs(data)
            console.log('clubs: ', clubs)
        }
    }

    const fetchMeetingData = async () => {
        const url = `https://bookingforbooky.com/api/meeting/${pageOwnerID}/user`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setMeetings(data)
        }
    }

    const fetchFriends = async () => {
        const url = `https://bookingforbooky.com/api/${pageOwnerID}/friends`
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
        <main style={{ backgroundColor: '#8A807E' }}>
            <div className="userPage">
                <div className="userInfo">
                    <img
                        src={pageOwner.picture_url}
                        alt="User avatar"
                        style={{
                            maxWidth: '250px',
                            maxHeight: '250px',
                        }}
                    />
                    <div>{pageOwner.username}</div>
                </div>

                <div className="scoreDisplay">
                    <div>SCORE: {pageOwner.score}</div>
                </div>

                <div className="clubList">
                    <table
                        style={{
                            overflowY: 'auto',
                            maxHeight: '400px',
                            width: '100%',
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}>Clubs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clubs.length > 0 &&
                            user.id === Number(pageOwnerID) ? (
                                <>
                                    {clubs.map((club) => (
                                        <tr key={club.club_id}>
                                            <td style={{ textAlign: 'center' }}>
                                                <NavLink
                                                    to={`/clubs/${club.club_id}`}
                                                    className="link"
                                                >
                                                    {club.name}
                                                </NavLink>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td style={{ textAlign: 'center' }}>
                                            <NavLink
                                                aria-current="page"
                                                to="/clubs"
                                                exact={true}
                                                className="link button"
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '10px 20px',
                                                    borderRadius: '5px',
                                                    backgroundColor: 'white',
                                                    color: '#fff',
                                                    textDecoration: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Create a club
                                            </NavLink>
                                        </td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td
                                        colSpan="1"
                                        style={{ textAlign: 'center' }}
                                    >
                                        No clubs...
                                        <div>
                                            <NavLink
                                                to="/clubs/list"
                                                className="link"
                                            >
                                                Join a club
                                            </NavLink>{' '}
                                            or{' '}
                                            <NavLink
                                                to="/clubs"
                                                className="link"
                                            >
                                                create your own!
                                            </NavLink>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="friend-list">
                    {user && user.id == pageOwnerID && (
                        <Link to={'/requests'} exact="true" className="link">
                            <h4>Friend Requests ({requests.length})</h4>
                        </Link>
                    )}
                    <h3>{pageOwner.username}'s Friends</h3>
                    {friends.length > 0 ? (
                        <list>
                            {friends.map((friend) => (
                                <li key={friend.friend_id}>
                                    {user && user.id == pageOwnerID && (
                                        <button
                                            onClick={() =>
                                                handleRemoveFriend(
                                                    friend.friend_id
                                                )
                                            }
                                        >
                                            Remove Friend
                                        </button>
                                    )}
                                </li>
                            ))}
                        </list>
                    ) : (
                        <div>No friends...</div>
                    )}
                </div>
                <div className="currentMeetings">
                    <h2>Current Meetings</h2>
                    {currentMeetings.length > 0 ? (
                        <>
                            <a
                                href={`/meetings/${currentMeetings[currentIndex].id}`}
                            >
                                <div>
                                    {currentMeetings[currentIndex].book_title}
                                </div>
                                <div>
                                    {currentMeetings[currentIndex].active}
                                </div>
                            </a>
                            <div>
                                <button onClick={handlePrevMeeting}>
                                    Previous
                                </button>
                                <button onClick={handleNextMeeting}>
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <div>No meetings scheduled...</div>
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
                                        <div key={meeting.id}>
                                            <a href={`/meetings/${meeting.id}`}>
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
            </div>
        </main>
    )
}
