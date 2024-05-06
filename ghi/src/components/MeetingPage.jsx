import useAuthService from '../hooks/useAuthService'
import { useState, useEffect } from 'react'
import { NavLink, useParams, useOutletContext } from 'react-router-dom'
import Meeting from './ListMeetings'

export default function MeetingPage(){
    const {deleteSuccess, setDeleteSuccess} = useOutletContext()
    const [club, setClub] = useState({})
    const [book, setBook] = useState({})
    // Meetings
    const { meetingID } = useParams()
    const [meeting, setMeeting] = useState({})
    // Score
    const [pageInput, setPageInput] = useState(0)
    // Attendees
    const [attendeeTable, setAttendeeTable] = useState({})
    const [actualAttendees, setActualAttendees] = useState([])
    // User Info
    const { user } = useAuthService()
    const [authUser, setAuthUser] = useState({})
    const [users, setUsers] = useState([])
    // Bets
    const [selectedAttendeeId, setSelectedAttendeeId] = useState('')
    const [betAmount, setBetAmount] = useState(0)

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

        const url = `http://localhost:8000/api/attendees/${meetingID}`
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
            fetchUsers()
            console.log('request is good and went through')
        }
    }

    const leaveMeeting = async (id) => {
        const url = `http://localhost:8000/api/attendees/${id}/leave`
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
            fetchUsers()
        } else {
            console.error('http error:', response.status)
        }
    }





    const deleteMeeting = async (id) => {
        const url = `http://localhost:8000/api/meeting/${id}/`;
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
        (setDeleteSuccess(!deleteSuccess))
        }
        if (!response.ok) {
        console.error('http error:', response.status);
    }};


    const fetchUsers = async () => {
        const url = `http://localhost:8000/api/meeting/${meetingID}/users`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setUsers(data.sort((a, b) => b.score - a.score))
        }
    }

    const fetchActualAttendees = async () => {
        const url = `http://localhost:8000/api/attendees/${meetingID}/attendees`
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
            `http://localhost:8000/books/title/${encodeURIComponent(
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
        const url = `http://localhost:8000/api/attendees/page/${meetingID}/${user.id}`
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

    const handleUpdatePage = () => {
        updateAttendeePage(attendeeTable.attendee_id).then(() => {
            updateUserScore(pageInput)
            updateClubScore(pageInput)
        })
    }

    const updateAttendeeTable = async (
        meetingId,
        attendeeId,
        attendeePage,
        placeAtLastFinish,
        Finished
    ) => {
        const url = `http://localhost:8000/api/attendees/page`
        const bodyData = JSON.stringify({
            meeting_id: meetingId,
            attendee_id: attendeeId,
            attendee_page: attendeePage,
            place_at_last_finish: placeAtLastFinish,
            finished: Finished,
        })

        const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: bodyData
        })
        if (response.ok) {
            setAttendeeTable(await response.json())
            setPageInput(0)
        }
    }

    const updateAttendeePage = async (attendeeID) => {
        const url = `http://localhost:8000/api/attendees/page`
        const bodyData = JSON.stringify({
            meeting_id: meetingID,
            attendee_id: attendeeID,
            attendee_page: pageInput,
            place_at_last_finish: attendeeTable.place_at_last_finish,
            finished: attendeeTable.finished,
        })

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
    }

    const saveRanksEachFinish = async () => {
        let attendees_finished = []
        let attendees_unfinished = []
        // Split attendees into finished...
        attendees_finished = actualAttendees.filter(
            (a) => a.meeting_id === parseInt(meetingID) && a.finished === true
        )
        console.log('finished', attendees_finished)
        let rank = attendees_finished.length
        /// ...and unfinished
        attendees_unfinished = actualAttendees
            .filter(
                (a) =>
                    a.meeting_id === parseInt(meetingID) && a.finished === false
            )
            .sort((a, b) => b.attendee_page - a.attendee_page)
        console.log('unfinished', attendees_unfinished)
        // Set rank at time of finish
        attendees_unfinished.forEach((a) => {
            rank++
            console.log("attendee: ", rank, a)
            a.place_at_last_finish = rank
            if (a.attendee_page === book.page_count) {
                a.finished = true
            }
            // Update the database
            updateAttendeeTable(meetingID, a.attendee_id, a.attendee_page, a.place_at_last_finish, a.finished)
            console.log(a.attendee_id, rank)
        })
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
    const handleBetSubmit = (e) => {
        e.preventDefault()
        console.log(
            `Bet placed on attendee ID: ${selectedAttendeeId} with amount: ${betAmount}`
        )
        // Here you can add logic to handle the betting process, such as updating the state or making an API call.
        // Reset form fields
        setSelectedAttendeeId('')
        setBetAmount(0)
    }
    const maxScore = Math.max(...users.map((u) => u.score))

    useEffect(() => {
        fetchMeetingData()
        fetchAuthUserData()
        fetchAttendeeTable()
        deleteMeeting()
        fetchActualAttendees()
        fetchUsers()
    }, [])

    useEffect(() => {
        fetchMeetingData()
        fetchUsers()
        // Runs more often than it should
        if (attendeeTable.attendee_page === book.page_count) {
            saveRanksEachFinish()
        }
    }, [actualAttendees, attendeeTable])

    

    return (
        <>
            <h1>
                {club.name} - {meeting.book_title}
            </h1>
            {/* {attendeeTable.attendee_page < book.page_count ? ( */}
            {true ? (
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
                        min={1}
                        max={book.page_count}
                    />
                    <button onClick={handleUpdatePage}>Submit</button>
                </div>
            ) : (
                <div id="placeYourBet">
                    <form onSubmit={handleBetSubmit}>
                        <div>
                            <label htmlFor="attendeeSelect">
                                Who will finish next?
                            </label>
                            <select
                                id="attendeeSelect"
                                value={selectedAttendeeId}
                                onChange={(e) =>
                                    setSelectedAttendeeId(e.target.value)
                                }
                            >
                                {actualAttendees
                                    .filter((a) => !a.finished)
                                    .map((attendee) => (
                                        <option
                                            key={attendee.id}
                                            value={attendee.id}
                                        >
                                            {attendee.username}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="betAmount">Bet Amount:</label>
                            <input
                                type="number"
                                id="betAmount"
                                value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)}
                                placeholder="Enter your bet amount"
                            />
                        </div>
                        <button type="submit">Place Bet</button>
                    </form>
                </div>
            )}
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
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>
                                    {u.score === maxScore ? '👑' : null}
                                    {u.username}
                                    <img
                                        className="attendee_profile"
                                        src={u.picture_url}
                                        alt=""
                                    />
                                </td>
                                <td>{u.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <button onClick={() => joinMeeting(meeting.id)}>
                    join meeting
                </button>
                <button onClick={() => leaveMeeting(meeting.id)}>
                    leave meeting
                </button>
            </div>
            <div>
                {user.id == club.owner_id &&
                <button style ={{backgroundColor: 'red'}} onClick={() => deleteMeeting(meeting.id)}>
                    <NavLink aria-current="page" to={"/meetings/list/"} exact=
                    "true" className='link'>
                        delete meeting
                        </NavLink>
                    </button>
                    }
            </div>
        </>
    );
}
