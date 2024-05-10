import React, { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'
import { useLocation, useNavigate } from 'react-router-dom'

function CreateMeetingForm() {
    const [clubId, setClubId] = useState('')
    const [bookTitle, setBookTitle] = useState('')
    const [active, setActive] = useState('')
    const [data, setData] = useState([])
    const { user } = useAuthService()
    const navigate = useNavigate()

    const location = useLocation()
    if (location !== null) {
    }

    const state = [location.state]
    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     */

    const test = location.state

    const getData = async () => {
        const url = 'http://localhost:8000/api/clubs'
        const response = await fetch(url, { credentials: 'include' })

        if (response.ok) {
            const data = await response.json()
            setData(data.filter((club) => club.owner_id == user.id))
        }
    }

    useEffect(() => {
        getData()
    }, [])

    const handleClubChange = (event) => {
        setClubId(event.target.value)
    }

    async function handleFormSubmit(event) {
        event.preventDefault()
        const data = {}
        data.club_id = Number(clubId)
        data.book_title = test.volumeInfo.title
        data.active = active

        const meetingUrl = 'http://localhost:8000/api/meeting/create/'
        const fetchConfig = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }
        const response = await fetch(meetingUrl, fetchConfig)
        const responseData = await response.json()

        navigate(`/meetings/${responseData.id}`)

        if (response.ok) {
            setClubId('')
            setBookTitle('')
            setActive('')
        } else {
            console.error('failed to create meeting')
        }
    }

    if (user) {
        return (
            <form onSubmit={handleFormSubmit}>
                {location.state &&
                    location.state.hasOwnProperty('volumeInfo') &&
                    state.map((book) => {
                        return (
                            <ul>
                                <img
                                    src={book.volumeInfo.imageLinks.thumbnail}
                                ></img>
                                <ul key={book.volumeInfo.title}>
                                    {book.volumeInfo.title}
                                </ul>
                            </ul>
                        )
                    })}

                <select
                    type="number"
                    value={clubId}
                    onChange={handleClubChange}
                    required
                    name="club_id"
                    id="club_id"
                    className="form-select"
                    placeholder="club"
                >
                    {data.map((club) => (
                        <option key={club.club_id} value={club.club_id}>
                            {club.name}
                        </option>
                    ))}
                </select>

                {/* <input
                    type="text"
                    value={bookTitle}
                    onChange={(event) => setBookTitle(event.target.value)}
                    placeholder="book title"
                /> */}

                <input
                    type="date"
                    value={active}
                    onChange={(event) => setActive(event.target.value)}
                    placeholder="active date"
                />

                <button type="submit">Create Meeting</button>
                <div></div>
                <div>
                    <h4>Create a meeting for your club</h4>
                    <div>
                        Don't own a club? Make one
                        <a href="http://localhost:5173/clubs"> here</a>
                    </div>
                </div>
            </form>
        )
    } else {
        return (
            <>
                <p> You are not signed in</p>
            </>
        )
    }
}
export default CreateMeetingForm
