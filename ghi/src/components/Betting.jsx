import useAuthService from '../hooks/useAuthService'
import { useState, useEffect } from 'react'
import { Navigate, useParams, useOutletContext } from 'react-router-dom'

export default function Betting(){
    const { meetingID } = useParams()
    // Bets
    const [selectedAttendeeId, setSelectedAttendeeId] = useState('')
    const [betPlaced, setBetPlaced] = useState(false);
    const [betAmount, setBetAmount] = useState(0)
    const [attendees, setAttendees] = useState([])
    const [users, setUsers] = useState([])
    const { user } = useAuthService()

    const handleBetSubmit = async (e) => {
        e.preventDefault()
        const url = `http://localhost:8000/api/bets/place`
        const data = {
            meeting_id: parseInt(meetingID),
            better_id: parseInt(user.id),
            horse_id: parseInt(selectedAttendeeId),
            amount: parseInt(betAmount),
            paid: false
        }
        console.log({data})
        const fetchConfig = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
          }
        }
        const response = await fetch(url, fetchConfig);
        console.log({response})

        if (response.ok) {
            setSelectedAttendeeId('')
            setBetAmount(0)
            setBetPlaced(true)
        }
    }

    const fetchAttendee = async () => {
        const url = `http://localhost:8000/api/attendees/page/${meetingID}/${user.id}`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setAttendeeTable(data)
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
    // const fetchAttendees = () => {
    //     const url = `http://localhost:8000/api/attendees/${meetingID}/attendees`
    //     const fetchPromise = fetch(url, { credentials: 'include' })
    //     fetchPromise
    //         .then((response) => {
    //             return response.json()
    //         })
    //         .then((data) => {
    //             const attendee_pool = data.filter((a) => !a.finished);
    //             console.log("!!!", attendee_pool[0].attendee_id)
    //             setSelectedAttendeeId(attendee_pool[0].attendee_id)
    //             return data
    //         })

    const fetchUsers = async () => {
        const url = `http://localhost:8000/api/meeting/${meetingID}/users`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setUsers(data.sort((a, b) => b.score - a.score))
        }
    }

    const getDisplayAttendees = () => {
        return attendees
            .filter((a) => !a.finished)
            .map((a) => {
                const user = users.find((u) => u.id === a.attendee_id)
                return {
                    ...a,
                    username: user ? user.username : 'Unknown', // Fallback if no user is found
                }
            })
    }

    useEffect(() => {
        fetchUsers();
        fetchAttendees();

    }, []);

    return (
        <main style={{ backgroundColor: '#8A807E' }}>
            {betPlaced && <Navigate to={`/meetings/${meetingID}`} />}
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
                            {getDisplayAttendees().map((a) => (
                                <option
                                    key={a.attendee_id}
                                    value={a.attendee_id}
                                >
                                    {a.username}
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
                            placeholder="What will you risk?"
                        />
                    </div>
                    <button type="submit">Place Bet</button>
                </form>
            </div>
        </main>
    )
}

    // const saveRanksEachFinish = async () => {
    //     let attendees_finished = []
    //     let attendees_unfinished = []
    //     // Split attendees into finished...
    //     attendees_finished = actualAttendees.filter(
    //         (a) => a.meeting_id === parseInt(meetingID) && a.finished === true
    //     )
    //     console.log('finished', attendees_finished)
    //     let rank = attendees_finished.length
    //     /// ...and unfinished
    //     attendees_unfinished = actualAttendees
    //         .filter(
    //             (a) =>
    //                 a.meeting_id === parseInt(meetingID) && a.finished === false
    //         )
    //         .sort((a, b) => b.attendee_page - a.attendee_page)
    //     console.log('unfinished', attendees_unfinished)
    //     // Set rank at time of finish
    //     attendees_unfinished.forEach((a) => {
    //         rank++
    //         console.log("attendee: ", rank, a)
    //         a.place_at_last_finish = rank
    //         if (a.attendee_page === book.page_count) {
    //             a.finished = true
    //         }
    //         // Update the database
    //         updateAttendeeTable(meetingID, a.attendee_id, a.attendee_page, a.place_at_last_finish, a.finished)
    //         console.log(a.attendee_id, rank)
    //     })
    // }

        // const updateAttendeeTable = async (
    //     meetingId,
    //     attendeeId,
    //     attendeePage,
    //     placeAtLastFinish,
    //     Finished
    // ) => {
    //     const url = `http://localhost:8000/api/attendees/page`
    //     const bodyData = JSON.stringify({
    //         meeting_id: meetingId,
    //         attendee_id: attendeeId,
    //         attendee_page: attendeePage,
    //         place_at_last_finish: placeAtLastFinish,
    //         finished: Finished,
    //     })

    //     const response = await fetch(url, {
    //         method: 'PATCH',
    //         credentials: 'include',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: bodyData
    //     })
    //     if (response.ok) {
    //         setAttendeeTable(await response.json())
    //         setPageInput(0)
    //     }
    // }
