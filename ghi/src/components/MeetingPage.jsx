import useAuthService from '../hooks/useAuthService'
import { useState, useEffect } from 'react'
import { NavLink, useParams, useOutletContext } from 'react-router-dom'

export default function MeetingPage() {
    const { deleteSuccess, setDeleteSuccess } = useOutletContext()
    const [club, setClub] = useState({})
    const [book, setBook] = useState({})
    // Meetings
    const { meetingID } = useParams()
    const [meeting, setMeeting] = useState({})
    // Score
    const [pageInput, setPageInput] = useState(0)
    // Attendees
    const [attendee, setAttendee] = useState({})
    const [attendees, setAttendees] = useState([])
    // User Info
    const { user } = useAuthService()
    const [authUser, setAuthUser] = useState({})
    const [User, setUser] = useState({})
    const [users, setUsers] = useState([])
    // Bets
    const [bets, setBets] = useState([])

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
    // const getId = (val) => (e) => {
    //     joinMeeting(val)
    // }

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
        const url = `http://localhost:8000/api/meeting/${id}/`
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
            setDeleteSuccess(!deleteSuccess)
        }
        if (!response.ok) {
            console.error('http error:', response.status)
        }
    }

    const fetchUsers = async () => {
        const url = `http://localhost:8000/api/meeting/${meetingID}/users`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setUsers(data)
        }
    }

    const fetchAttendees = async () => {
        const url = `http://localhost:8000/api/attendees/${meetingID}/attendees`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setAttendees(data)
        }
    }

    const fetchBets = async () => {
        const url = `http://localhost:8000/api/bets/${meetingID}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setBets(data)
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

    const fetchAttendee = async () => {
        const url = `http://localhost:8000/api/attendees/page/${meetingID}/${user.id}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setAttendee(data)
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

    // const fetchUserData = async (user_id) => {
    //     const url = `http://localhost:8000/api/users/${user_id}`
    //     // const response = await fetch(url, { credentials: 'include' })
    //     // if (response.ok) {
    //     //     console.log("working: ", response)
    //     //     response.then((data) => {
    //     //         return data.json()
    //     //     })
    //     //     const data = await response.json()
    //     //     // setAuthUser(data)
    //     // }
    //     fetch(url, {
    //         credentials: 'include',
    //         method: 'get',
    //         dataType: 'json',
    //         headers: {
    //             Accept: 'application/json',
    //             'Content-Type': 'application/json',
    //         },
    //     }).then(response => response.json())
    //     .then((response => {
    //         setUser(response)
    //         return response
    //     }))
    //     return response
    // }

    const handlePageInput = (event) => {
        const page = Number(event.target.value)
        setPageInput(page)
    }

    const handleUpdatePage = () => {
        const data = pageInput
        updateAttendeePage(attendee.attendee_id).then(() => {
            updateUserScore(data)
            updateClubScore(data)
        }).then( () => {
            if(data == book.page_count)
            {
                finish()
            }
        })
    }

    const finish = () => {
        // saveRanksEachFinish();
        payout()
    }

    const saveRanksEachFinish = async () => {
        let attendees_finished = []
        let attendees_unfinished = []
        // Split attendees into finished...
        attendees_finished = attendees.filter(
            (a) => a.meeting_id === parseInt(meetingID) && a.finished === true
        )
        console.log('finished', attendees_finished)
        let rank = attendees_finished.length
        /// ...and unfinished
        attendees_unfinished = attendees
            .filter(
                (a) =>
                    a.meeting_id === parseInt(meetingID) && a.finished === false
            )
            .sort((a, b) => b.attendee_page - a.attendee_page)
        console.log('unfinished', attendees_unfinished)
        // Set rank at time of finish
        attendees_unfinished.forEach((a) => {
            rank++
            console.log('attendee: ', rank, a)
            a.place_at_last_finish = rank
            if (a.attendee_page === book.page_count) {
                a.finished = true
            }
            // Update the database
            updateAttendee(
                meetingID,
                a.attendee_id,
                a.attendee_page,
                a.place_at_last_finish,
                a.finished
            )
            console.log(a.attendee_id, rank)
        })
    }

    const payout = async () => {
        const b = getCurrentBet()
        if (user.id === b.horse_id) {
            // Pay the user who just finished, that the better bet on.
            // Update user information
            let url = `http://localhost:8000/api/users/${user.id}`
            let updated_score = authUser.score + b.amount
            console.log(updated_score)
            let response = await fetch(url, {
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
            console.log('horse paid: ', updated_score)
            fetch(`http://localhost:8000/api/users/${b.better_id}`, {
                credentials: 'include',
                method: 'get',
                dataType: 'json',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((response) => {
                    console.log('kkkkk', response)
                    setUser(response)
                    return response
                })
                .then((r) => {
                    console.log('fdhaisojfheiow', r)
                    updated_score = r.score + b.amount
                    let response = fetch(
                        `http://localhost:8000/api/users/${b.better_id}`,
                        {
                            method: 'PATCH',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username: r.username,
                                email: r.email,
                                score: updated_score,
                                picture_url: r.picture_url,
                            }),
                        }
                    )

                    return response
                })
            // url = `http://localhost:8000/api/users/${b.better_id}`
            //     .then((response) => {
            //         console.log("thisresposne", response)
            //         return response.json()
            //     })
            //     .then((data) => {
            //         console.log(
            //             'user',
            //             data.username,
            //             'email',
            //             data.email,
            //             'score',
            //             updated_score,
            //             'pic',
            //             data.picture_url
            //         )
            //         let response = fetch(url, {
            //             method: 'PATCH',
            //             credentials: 'include',
            //             headers: { 'Content-Type': 'application/json' },
            //             body: JSON.stringify({
            //                 username: data.username,
            //                 email: data.email,
            //                 score: updated_score,
            //                 picture_url: data.picture_url,
            //             }),
            //         })
            //         return response
            //     })
            // // Pay better
            // const better = fetchUserData(b.better_id)
            // // Update user information
            // url = `http://localhost:8000/api/users/${b.better_id}`
            // updated_score = better.score + b.amount
            // console.log(updated_score)
            // response = await fetch(url, {
            //     method: 'PATCH',
            //     credentials: 'include',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         username: horse.username,
            //         email: horse.email,
            //         score: updated_score,
            //         picture_url: horse.picture_url,
            //     }),
            // })
            // console.log('better paid: ', updated_score)
        } else {
            // Pay only the user who just finished
            const url = `http://localhost:8000/api/users/${user.id}`
            const updated_score = authUser.score + b.amount
            // console.log(updated_score)
            // Update user information
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
            // console.log(response)
        }
    }

    const updateAttendee = async (
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
            setAttendee(await response.json())
            setPageInput(0)
        }
    }

    const updateAttendeePage = async (attendeeID) => {
        const url = `http://localhost:8000/api/attendees/page`
        const bodyData = JSON.stringify({
            meeting_id: meetingID,
            attendee_id: attendeeID,
            attendee_page: pageInput,
            place_at_last_finish: attendee.place_at_last_finish,
            finished: attendee.finished,
        })

        const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                meeting_id: meetingID,
                attendee_id: user.id,
                attendee_page: pageInput,
                place_at_last_finish: attendee.place_at_last_finish,
                finished: attendee.finished,
            }),
        })
        if (response.ok) {
            setAttendee(await response.json())
            setPageInput(0)
        }
    }

    const updateUserScore = async (input) => {
        const url = `http://localhost:8000/api/users/${user.id}`
        const updated_score = authUser.score + (input - attendee.attendee_page)
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
    }

    const updateClubScore = async (input) => {
        const url = `http://localhost:8000/api/clubs/${club.club_id}`
        const updated_score = club.score + (input - attendee.attendee_page)
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

    // const maxScore = Math.max(...attendees.map((a) => a.attendee_page))

    useEffect(() => {
        fetchMeetingData()
        fetchAuthUserData()
        fetchAttendee()
        fetchAttendees()
        fetchUsers()
        fetchBets()
    }, [])

    useEffect(() => {
        // fetchMeetingData()
        fetchUsers()
        // // Runs more often than it should
        // if (attendee.attendee_page === book.page_count) {
        //     saveRanksEachFinish()
        // }
    }, [attendees, attendee])

    useEffect(() => {
        fetchAttendees()
        fetchAttendee()
    }, [pageInput])
    // Used in user list
    const getAttendeePage = (userId) => {
        const a = attendees.find((a) => a.attendee_id === userId)
        return a ? a.attendee_page : 0 // Default to 0 if attendee not found
    }

    const sortedUsers = [...users].sort(
        (a, b) => getAttendeePage(b.id) - getAttendeePage(a.id)
    )

    const getCurrentBet = () => {
        const b = bets.find((b) => b.paid === false)
        // console.log('!!!!', b)
        return b ? b : null
    }

    return (
        <>
            <h1>
                {club.name} - {meeting.book_title}
            </h1>
            {/* {bets.length > 0 ? ( */}
            {/* <div className="betAnnouncement">
                {getCurrentBet().better_id} bet {getCurrentBet().amount} that {getCurrentBet().horse_id} will finish next.
                Prove them wrong by finishing next and receive !
            </div> */}
            {/* ) : ( */}
                <div>
                </div>
            {/* )} */}
            {/* {attendee.attendee_page < book.page_count ? ( */}
                <div className="updateProgress">
                    <h2>Update Your Progress</h2>
                    <div className="currentProgress">
                        {attendee.attendee_page}/{book.page_count}
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
            {/* ) : !bets.some((bet) => bet.better === user.id) ? ( */}
                <div id="placeYourBet">
                    <NavLink
                        aria-current="page"
                        to={'/bets/' + meetingID}
                        exact="true"
                    >
                        Place your bet!
                    </NavLink>
                </div>
            {/* ) : ( */}
                <div></div>
            {/* )} */}
            <div
                style={{
                    overflowY: 'auto',
                    maxHeight: '400px',
                    maxWidth: '500px',
                }}
            >
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Member</th>
                            <th style={{ textAlign: 'right' }}>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((u, index) => (
                            <tr key={u.id}>
                                <td>
                                    {/* {index === 0 &&
                                    !attendees.some((a) => a.finished === true)
                                        ? '👑'
                                        : null} */}
                                    {index + 1}
                                </td>
                                <td style={{ textAlign: 'left' }}>
                                    <a
                                        href={`/user/${u.id}`}
                                        style={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                        }}
                                    >
                                        <img
                                            className="attendee_profile"
                                            src={u.picture_url}
                                            alt={u.username}
                                            style={{
                                                maxHeight: '40px',
                                                maxWidth: '40px',
                                                verticalAlign: 'middle',
                                            }}
                                        />
                                        {u.username}
                                    </a>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {getAttendeePage(u.id)} / {book.page_count}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                {attendees.some((a) => a.attendee_id === user.id) ? (
                    <button onClick={() => leaveMeeting(meeting.id)}>
                        Leave Meeting
                    </button>
                ) : (
                    <button onClick={() => joinMeeting(meeting.id)}>
                        Join Meeting
                    </button>
                )}
            </div>
            <div>
                {user.id == club.owner_id && (
                    <button
                        style={{ backgroundColor: 'red' }}
                        onClick={() => deleteMeeting(meeting.id)}
                    >
                        <NavLink
                            aria-current="page"
                            to={'/meetings/list/'}
                            exact="true"
                            className="link"
                        >
                            delete meeting
                        </NavLink>
                    </button>
                )}
            </div>
        </>
    )
}
