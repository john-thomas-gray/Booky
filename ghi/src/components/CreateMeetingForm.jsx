import React, { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'
import { useLocation } from 'react-router-dom'

function CreateMeetingForm() {
    const [clubId, setClubId] = useState('')
    const [bookTitle, setBookTitle] = useState('')
    const [active, setActive] = useState('')
    const [data, setData] = useState([])
    const { user } = useAuthService()

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
            setData(data)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    const handleClubChange = (event) => {
        setClubId(event.target.value)
        console.log('event.target.value)', event.target.value)
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
        console.log(
            'state.volumeInfo.titlestate.volumeInfo.title!!!!',
            state.volumeInfo.title
        )

        if (response.ok) {
            setClubId('')
            setBookTitle('')
            setActive('')
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
