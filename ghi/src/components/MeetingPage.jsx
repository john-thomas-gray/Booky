import useAuthService from '../hooks/useAuthService'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function MeetingPage() {
    const [club, setClub] = useState({})
    const [meeting, setMeeting] = useState({})
    const [attendeeTable, setAttendeeTable] = useState({})
    const [actualAttendees, setActualAttendees] = useState([])
    const [book, setBook] = useState({})
    const [pageInput, setPageInput] = useState(0)
    const [authUser, setAuthUser] = useState({})
    const { user } = useAuthService()
    const { meetingID } = useParams()
    const [attendees, setAttendees] = useState([])

    const fetchMeetingData = () => {
        const url = `http://localhost:8000/api/meeting/${meetingID}`
        const fetchPromise = fetch(url, { credentials: 'include' })
        fetchPromise
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                setMeeting(data)
                return data
            })
            .then((data) => {
                fetchBookData(data)
                return data
            })
            .then((data) => {
                fetchClubData(data)
                return data
            })
    }
    const getId = (val) => (e) => {
        joinMeeting(val)
    }

    const joinMeeting = async (val) => {
        const data = {}
        data.attendee_id = user.id
        data.meeting_id = val

        const url = `http://localhost:8000/api/meeting/${meetingID}`
        const fetchConfig = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }
        const response = await fetch(url, fetchConfig)
        if (response.ok) {
            fetchAttendees()
            console.log('request is good and went through')
        }
    }

    const leaveMeeting = async (id) => {
        const url = `http://localhost:8000/api/meeting/${id}/leave`
        const fetchConfig = {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            credentials: 'include',
        }
        const response = await fetch(url, fetchConfig)
        if (response.ok) {
            fetchAttendees()
        } else {
            console.error('http error:', response.status)
        }
    }

    const fetchAttendees = async () => {
        const url = `http://localhost:8000/api/meeting/${meetingID}/attendees`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setAttendees(data.sort((a, b) => b.score - a.score))
        }
    }

    const fetchActualAttendees = async () => {
        const url = `http://localhost:8000/api/meeting/${meetingID}/attendees/actual`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setActualAttendees(data)
        }
    }

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
        fetchPromise
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                setBook(data)
            })
    }

    const fetchAttendeeTable = async () => {
        const url = `http://localhost:8000/api/meeting/page/${meetingID}/${user.id}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setAttendeeTable(data)
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

    const updateAttendeeTable = async () => {
        const url = `http://localhost:8000/api/meeting/page`
        const bodyData = JSON.stringify({
            meeting_id: meetingID,
            attendee_id: user.id,
            attendee_page: pageInput,
            place_at_last_finish: attendeeTable.place_at_last_finish,
            finished: attendeeTable.finished,
        })

        console.log('Sending data:', bodyData)
        const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                meeting_id: meetingID,
                attendee_id: user.id,
                attendee_page: pageInput,
                place_at_last_finish: attendeeTable.place_at_last_finish,
                finished: attendeeTable.finished,
            }),
        })
        if (response.ok) {
            setAttendeeTable(await response.json())
            setPageInput(0)
        }
        updateUserScore(pageInput)
        updateClubScore(pageInput)
    }

    // const setRanksAtLastFinish = async () => {
    //     let rank = 0
    //     let attendees_finished = []
    //     let attendees_unfinished = []
    //     // Split attendees into finished...
    //     attendees_finished = actualAttendees.filter(
    //         ((a) =>
    //             a.meeting_id === meeting_id && a.finished) || a.meeting_id === meeting_id &&
    //             a.attendee_id === user.id
    //     )
    //     /// ...and unfinished
    //     attendees_unfinished = actualAttendees
    //         .filter((a) => a.meeting_id === meetingID)
    //         .sort((a, b) => b.score - a.score)

    //     // Set rank at time of finish
    //     attendees_unfinished.forEach((a) => {
    //         a.
    //     })
    // }

    const updateUserScore = async (input) => {
        const url = `http://localhost:8000/api/users/${user.id}`
        console.log('userscore', authUser.score)
        console.log('pagecount', attendeeTable.attendee_page)
        console.log('input', input)
        const updated_score =
            authUser.score + (input - attendeeTable.attendee_page)
        console.log('updated score', updated_score)
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
        const updated_score = club.score + (input - attendeeTable.attendee_page)
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

    const maxScore = Math.max(...attendees.map((attendee) => attendee.score))

    useEffect(() => {
        fetchMeetingData()
        fetchAuthUserData()
        fetchAttendeeTable()
        fetchAttendees()
        fetchActualAttendees()
    }, [])

    useEffect(() => {
        fetchMeetingData()
        fetchAttendees()
    }, [actualAttendees, attendeeTable])

    return (
        <>
            <h1>
                {club.name} - {meeting.book_title}
            </h1>
            {attendeeTable.attendee_page < book.page_count ? (
                <div className="updateProgress">
                    <h2>Update Your Progress</h2>
                    <div className="currentProgress">
                        {attendeeTable.attendee_page}/{book.page_count}
                    </div>
                    <input
                        type="number"
                        placeholder="What page are you on?"
                        value={pageInput}
                        onChange={handlePageInput}
                        // min={attendeeTable.attendee_page + 1}
                        // max={book.page_count}
                    />
                    <button onClick={updateAttendeeTable}>Submit</button>
                </div>
            ) : (
                <div id="placeYourBets"></div>
            )}
            <div>
                <button onClick={() => joinMeeting(meeting.id)}>
                    join meeting
                </button>
            </div>
            <div>
                <button onClick={() => leaveMeeting(meeting.id)}>
                    leave meeting
                </button>
            </div>
            <div>
                {/* Should rank attendees based upon their book progress
                in the current meeting, not how much score they have overall. */}
                <table>
                    <thead>
                        <tr>
                            <th>Attendees</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendees.map((attendee) => {
                            return (
                                <tr key={attendee.id}>
                                    <td>
                                        {attendee.score === maxScore
                                            ? '👑'
                                            : null}
                                        {attendee.username}
                                        <img
                                            className="attendee_profile"
                                            src={attendee.picture_url}
                                        ></img>
                                    </td>
                                    <td>{attendee.score}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}
