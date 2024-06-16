import { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'

function CreateMeetingForm() {
    const [clubId, setClubId] = useState('')
    const [clubName, setClubName] = useState('')
    const [clubScore, setClubScore] = useState('')
    const [bookTitle, setBookTitle] = useState('')
    const [totalPages, setTotalPages] = useState('')
    const [currentPage, setCurrentPage] = useState('')
    const [active, setActive] = useState('')
    const [data, setData] = useState([])
    const { user } = useAuthService()

    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     */

    const getData = async () => {
        const url = 'https://bookingforbooky.com/api/clubs'
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
        setClubName(event.target.value)
    }

    async function handleFormSubmit(event) {
        event.preventDefault()
        const data = {}
        data.club_id = clubId
        data.club_name = clubName
        data.club_score = clubScore
        data.book_title = bookTitle
        data.total_pages = totalPages
        data.current_page = currentPage
        data.active = active

        const meetingUrl = 'https://bookingforbooky.com/api/meeting/create/'
        const fetchConfig = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        }
        const response = await fetch(
            meetingUrl,
            { credentials: 'include' },
            fetchConfig
        )

        if (response.ok) {
            setClubId('')
            setClubName('')
            setClubScore('')
            setBookTitle('')
            setTotalPages('')
            setCurrentPage('')
            setActive('')
        }
    }

    if (user) {
        return (
            <form onSubmit={handleFormSubmit}>
                <div>this is CreateMeetingForm.jsx</div>

                <select
                    value={clubName}
                    onChange={handleClubChange}
                    required
                    name="club_name"
                    id="club_name"
                    className="form-select"
                >
                    <option value="">select a club</option>
                    {data.map((club) => (
                        <option key={club.name} value={club.name}>
                            {club.name}
                        </option>
                    ))}
                </select>

                <input
                    type="int"
                    value={clubId}
                    onChange={(event) => setClubId(event.target.value)}
                    placeholder="club id"
                />

                <input
                    type="int"
                    value={clubScore}
                    onChange={(event) => setClubScore(event.target.value)}
                    placeholder="club score"
                />

                <input
                    type="text"
                    value={bookTitle}
                    onChange={(event) => setBookTitle(event.target.value)}
                    placeholder="book title"
                />

                <input
                    type="text"
                    value={totalPages}
                    onChange={(event) => setTotalPages(event.target.value)}
                    placeholder="total pages"
                />

                <input
                    type="text"
                    value={currentPage}
                    onChange={(event) => setCurrentPage(event.target.value)}
                    placeholder="current page"
                />

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
