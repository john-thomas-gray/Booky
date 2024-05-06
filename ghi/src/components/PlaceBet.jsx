import useAuthService from '../hooks/useAuthService'
import { useState, useEffect } from 'react'
import { NavLink, useParams, useOutletContext } from 'react-router-dom'

export default function PlaceBet(){
    const { meetingID } = useParams()
    // Bets
    const [selectedAttendeeId, setSelectedAttendeeId] = useState('')
    const [betAmount, setBetAmount] = useState(0)
    const [attendees, setAttendees] = useState([])
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

    return (
        <>
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
                            {attendees
                                .filter((a) => !a.finished)
                                .map((a) => (
                                    <option
                                        key={a.id}
                                        value={a.id}
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
                            placeholder="Enter your bet amount"
                        />
                    </div>
                    <button type="submit">Place Bet</button>
                </form>
                <NavLink
                    aria-current="page"
                    to={'/bets/' + meetingID}
                    exact="true"
                >
                    Place your bet!
                </NavLink>
            </div>
        </>
    )
}
