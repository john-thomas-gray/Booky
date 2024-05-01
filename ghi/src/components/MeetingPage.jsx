import useAuthService from '../hooks/useAuthService'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function MeetingPage() {
    const [club, setClub] = useState([]);
    const [meeting, setMeeting] = useState([]);
    const [attendeePage, setAttendeePage] = useState(0);
    const [pageInput, setPageInput] = useState(attendeePage.attendee_page);
    const [authUser, setAuthUser] = useState([]);
    const { user } = useAuthService();
    const { meetingID } = useParams();


    const fetchMeetingData = async () => {
        const url = `http://localhost:8000/api/meeting/${meetingID}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setMeeting(data)
        }
    }

    const fetchClubData = async () => {
        const url = `http://localhost:8000/api/clubs/${meeting.club_id}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setClub(data)
        }
    }

    const fetchAttendeePage = async () => {
        const url = `http://localhost:8000/api/meeting/page/${meetingID}/${user.id}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setAttendeePage(data)
        }
    }

    const fetchAuthUserData = async () => {
        const url = `http://localhost:8000/api/users/${user.id}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setAuthUser(data)
        }
    }

    const handlePageInput = (event) => {
        setPageInput(Number(event.target.value))
    }

    const updateAttendeePage = async () => {
        const url = `http://localhost:8000/api/meeting/page`
        const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meeting_id: meetingID, attendee_id: authUser.id, attendee_page: pageInput }),
        })
        if (response.ok) {
            setAttendeePage(await response.json())
        }
        updateUserScore(pageInput)
    }

    const updateUserScore = async (input) => {
        const url = `http://localhost:8000/api/users/${user.id}`;
        const updated_score = authUser.score + (input - attendeePage.attendee_page);
        const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: authUser.username, email: authUser.email, score: updated_score, picture_url: authUser.picture_url }),
        })
        if (response.ok) {
            setAuthUser(await response.json())
        }
    }

    // const updateClubScore = async (input) => {
    //     const url = `http://localhost:8000/api/clubs/${club.club_id}`
    //     const updated_score =
    //         club.score + (input - attendeePage.attendee_page)
    //     console.log(updated_score)
    //     console.log(attendeePage.attendee_page)
    //     const response = await fetch(url, {
    //         method: 'PATCH',
    //         credentials: 'include',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             name: club.username,
    //             score: updated_score,
    //             city: club.city,
    //             state: club.state,
    //             country: club.country,
    //         }),
    //     })
    //     if (response.ok) {
    //         setClub(await response.json())
    //     }
    // }

    useEffect(() => {
        fetchMeetingData()
        fetchClubData()
        fetchAuthUserData()
        fetchAttendeePage()
    }, []);

    return (
        <>
            <h1>{club.name} - BOOK NAME</h1>
            <div className="updateProgress">
                <h2>Update Your Progress</h2>
                <div className="currentProgress">
                    {attendeePage.attendee_page}/546{' '}
                </div>
                <input
                    type="number"
                    placeholder="What page are you on?"
                    value={pageInput}
                    onChange={handlePageInput}
                    // min={attendeePage.attendee_page + 1}
                    // max={546} << book page
                />
                <button onClick={updateAttendeePage}>Submit</button>
            </div>
        </>
    )
}
