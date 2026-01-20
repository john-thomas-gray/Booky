import { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'
import { useParams } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { API_HOST } from '../config'

export default function ClubDetailPage() {
    const [club, setClub] = useState('')
    const { clubID } = useParams()
    const { user } = useAuthService()
    const [hideComponent, setHideComponent] = useState(true)
    const [error, setError] = useState(null)
    const [members, setMembers] = useState([])
    const [meetings, setMeetings] = useState([])

    const currentMeetings = meetings.filter(
        (meeting) => new Date(meeting.active) > new Date()
    )
    const pastMeetings = meetings.filter(
        (meeting) => new Date(meeting.active) < new Date()
    )

    const getID = (val) => {
        joinClub(val)
    }

    const joinClub = async (val) => {
        const data = {}
        data.member_id = user.id
        data.club_id = val
        const membersUrl = `${API_HOST}/api/users/club/${val}/`
        const fetchConfig = {
            method: 'post',
            body: JSON.stringify(data),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        }
        const response = await fetch(membersUrl, fetchConfig).catch((error) =>
            setError(error)
        )
        if (response.ok) {
            fetchMembers()
        }
    }

    const fetchMembers = async () => {
        const url = `${API_HOST}/api/users/club/${clubID}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setMembers(data)
        }
    }

    const fetchMeetings = async () => {
        const url = `${API_HOST}/api/meeting/club/${clubID}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setMeetings(data)
        }
    }

    const fetchClub = async () => {
        const url = `${API_HOST}/api/clubs/${clubID}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setClub(data)
        }
    }

    useEffect(() => {
        fetchClub()
        fetchMembers()
        fetchMeetings()
        setInterval(() => {
            setHideComponent(!hideComponent)
        }, 2500)
    }, [])

    if (user) {
        const isMember =
            members.filter(
                (member) => Number(member.id) == Number(user.id)
            ).length > 0
        const isOwner = user.id == club.owner_id
        return (
            <main className="club-page">
                {error && hideComponent && (
                    <h1 className="m3 mt-3">You are already in this club!</h1>
                )}
                <h1 className="club-title">{club.name}</h1>
                <div className="club-grid">
                    <aside className="club-sidebar">
                        <div className="club-panel">
                            {!isMember && (
                                <button
                                    className="club-primary"
                                    onClick={() => getID(club.club_id)}
                                >
                                    Request to Join
                                </button>
                            )}
                            <h3>Members</h3>
                            <ol className="club-list">
                                {members.map((member) => {
                                    return (
                                        <li key={member.id}>
                                            {member.username}
                                        </li>
                                    )
                                })}
                            </ol>
                        </div>
                        <div className="club-panel">
                            <h4>What page are you on?</h4>
                            <div className="club-muted">
                                Scrollable search coming soon.
                            </div>
                        </div>
                    </aside>

                    <section className="club-main">
                        <div className="club-panel club-stats">
                            <div>
                                <h4>Total Points Earned</h4>
                                <div className="club-value">
                                    {club.points || '10M'}
                                </div>
                            </div>
                            <div>
                                <h4>Books Completed</h4>
                                <div className="club-muted">
                                    {pastMeetings.length > 0
                                        ? pastMeetings
                                              .slice(0, 3)
                                              .map((meeting) => meeting.book_title)
                                              .join(', ')
                                        : 'No books yet.'}
                                </div>
                            </div>
                        </div>
                        <div className="club-panel">
                            <h3>Current reading period</h3>
                            {currentMeetings.length > 0 ? (
                                <div className="club-meeting">
                                    <div>
                                        <div className="club-value">
                                            {
                                                currentMeetings[0]
                                                    .book_title
                                            }
                                        </div>
                                        <div className="club-muted">
                                            {currentMeetings[0].active}
                                        </div>
                                    </div>
                                    <div className="club-progress">
                                        Progress
                                        <div className="club-progress-bar">
                                            <span />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="club-muted">
                                    No active meeting yet.
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="club-aside">
                        <div className="club-panel">
                            <h4>Betting</h4>
                            <p className="club-muted">
                                Place bets on finish times and pages read.
                            </p>
                        </div>
                        <div className="club-panel club-actions">
                            <NavLink to="/book" className="club-primary">
                                Create meeting
                            </NavLink>
                            <NavLink
                                to="/meetings"
                                className="club-secondary"
                            >
                                Sign up for this meeting
                            </NavLink>
                            {isOwner && (
                                <NavLink
                                    to="/clubs"
                                    className="club-secondary"
                                >
                                    Manage club
                                </NavLink>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        )
    } else {
        return (
            <>
                <h1 className="m3 mt-3">You are not signed in!</h1>
            </>
        )
    }
}
