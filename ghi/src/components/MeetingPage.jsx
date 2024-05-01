import React, { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'
import { useParams } from 'react-router-dom'
import { NavLink } from 'react-router-dom'



export default function MeetingPage(){
    const [club, setClub] = useState([])
    const [meeting, setMeeting] = useState([])
    const [attendeePage, setAttendeePage] = useState(0)
    const [book, setBook] = useState([])
    const [pageInput, setPageInput] = useState(attendeePage.attendee_page)
    const [authUser, setAuthUser] = useState([])
    const [attendees, setAttendees] = useState([]);
    const { user } = useAuthService()
    const { meetingID } = useParams()

    const fetchAttendees = async () => {
        const url = `http://localhost:8000/api/meeting/${meetingID}/attendees`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setAttendees(data)

        }
    }



    const fetchMeetingData = async () => {
        const url = `http://localhost:8000/api/meeting/${meetingID}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setMeeting(data)
        }
    }

    const getId = (val) => (e) => {
        joinMeeting(val)
    };

    const joinMeeting = async (val) => {
        const data = {}
        data.attendee_id = user.id
        data.meeting_id = val

        const url = `http://localhost:8000/api/meeting/${meetingID}`;
        const fetchConfig = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type' : 'application/json',
            },
            credentials: "include",
        };
        const response = await fetch(url, fetchConfig)
        if (response.ok){
            fetchAttendees()
            console.log(
                "request is good and went through"
            )
        }

    };

    const leaveMeeting = async (id) => {
    const url = `http://localhost:8000/api/meeting/${id}/leave`;
    const fetchConfig = {
        method: 'delete',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({}),
        credentials: "include",
    };


        const response = await fetch(url,fetchConfig );
    if (response.ok) {
      fetchAttendees();
    } else {
      console.error('http error:', response.status);
    }

    };

    const fetchClubData = async (data) => {
        const url = `http://localhost:8000/api/clubs/${data.club_id}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setClub(data)
        }
    }

    const fetchBookData = async (data) => {
        const url = new URL(
            `http://localhost:8000/api/books/title/${encodeURIComponent(
                data.book_title
            )}`
        ).href
        const fetchPromise = fetch(url, { credentials: 'include' })
        fetchPromise.then(response => {
            return response.json()
        }).then(data => {
            setBook(data)
        })
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
            body: JSON.stringify({
                meeting_id: meetingID,
                attendee_id: user.id,
                attendee_page: pageInput,
            }),
        })
        if (response.ok) {
            setAttendeePage(await response.json())
        }
        updateUserScore(pageInput)
        updateClubScore(pageInput)
    }

    const updateUserScore = async (input) => {
        const url = `http://localhost:8000/api/users/${user.id}`
        const updated_score =
            authUser.score + (input - attendeePage.attendee_page)
        const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: authUser.username,
                email: authUser.email,
                score: updated_score,
                picture_url: authUser.picture_url,
            }),
        })
        if (response.ok) {
            setAuthUser(await response.json())
        }
    }

    const updateClubScore = async (input) => {
        const url = `http://localhost:8000/api/clubs/${club.club_id}`
        const updated_score = club.score + (input - attendeePage.attendee_page)
        console.log(updated_score)
        console.log(attendeePage.attendee_page)
        const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: club.name,
                city: club.city,
                state: club.state,
                country: club.country,
                score: updated_score,
            }),
        })
        if (response.ok) {
            setClub(await response.json())
        }
    }

    const maxScore = Math.max(...attendees.map(attendee => attendee.score));
    attendees.sort((a,b) => b.score - a.score);

    useEffect(() => {
        fetchMeetingData()
        fetchAuthUserData()
        fetchAttendeePage()
        fetchAttendees()
    }, [])




    return (
        <>
            <h1>
                {club.name} - {meeting.book_title}
            </h1>
            <div className="updateProgress">
                <h2>Update Your Progress</h2>
                <div className="currentProgress">
                    {attendeePage.attendee_page}/{book.page_count}
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
            <div>
                <button onClick={() => joinMeeting(meeting.id)}>join meeting</button>
            </div>
             <div>
                <button onClick={() => leaveMeeting(meeting.id)}>leave meeting</button>
            </div>
            <div>
                <table>
                    <thead>
                    <tr>
                        <th>
                            Attendees
                        </th>
                        <th>
                            Score
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                        {attendees.map((attendee) => {
                            return (
                                <tr key={attendee.id}>
                                    <td>
                                        {attendee.score === maxScore ? "👑" : null}
                                        {attendee.username}
                                        <img className="attendee_profile" src={attendee.picture_url}></img>
                                    </td>
                                    <td>
                                        {attendee.score}

                                    </td>

                                </tr>
                            )
                        })}
                    </tbody>
                </table>

            </div>

        </>
    )
}
