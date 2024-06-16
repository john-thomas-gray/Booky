import useAuthService from '../hooks/useAuthService'
import { useState, useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'

export default function Betting() {
    const { meetingID } = useParams()
    // Bets
    const [selectedAttendeeId, setSelectedAttendeeId] = useState('')
    const [betPlaced, setBetPlaced] = useState(false)
    const [betAmount, setBetAmount] = useState(0)
    const [attendees, setAttendees] = useState([])
    const [users, setUsers] = useState([])
    const { user } = useAuthService()

    const handleBetSubmit = async (e) => {
        e.preventDefault()
        const url = `https://bookingforbooky.com/api/bets/place`
        const data = {
            meeting_id: parseInt(meetingID),
            better_id: parseInt(user.id),
            horse_id: parseInt(selectedAttendeeId),
            amount: parseInt(betAmount),
            paid: false,
        }
        const fetchConfig = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        }
        const response = await fetch(url, fetchConfig)

        if (response.ok) {
            setSelectedAttendeeId('')
            setBetAmount(0)
            setBetPlaced(true)
        }
    }

    // const fetchAttendee = async () => {
    //     const url = `https://bookingforbooky.com/api/attendees/page/${meetingID}/${user.id}`
    //     const response = await fetch(url, { credentials: 'include' })
    //     if (response.ok) {
    //         const data = await response.json()
    //         setAttendeeTable(data)
    //     }
    // }

    const fetchAttendees = async () => {
        const url = `https://bookingforbooky.com/api/attendees/${meetingID}/attendees`
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setAttendees(data)
        }
    }

    const fetchUsers = async () => {
        const url = `https://bookingforbooky.com/api/meeting/${meetingID}/users`
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
        fetchUsers()
        fetchAttendees()
    }, [])

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
