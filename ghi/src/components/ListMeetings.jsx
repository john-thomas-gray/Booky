import React, { useState, useEffect } from 'react'

export default function ListMeetings(){
const [meetings, setMeetings] = useState([])

const fetchData = async () => {
    const url = 'http://localhost:8000/api/meeting/'
    const response = await fetch(url)
    if (response.ok) {
        const data = await response.json()
        setMeetings(data)
    }
}

useEffect(() => {
    fetchData()
}, [])

 return (
        <>
            <h1 className="m3 mt-3">Meetings</h1>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Meeting ID</th>
                        <th>Club Name</th>
                        <th>Club Score</th>
                        <th>Book Title</th>
                        <th>Total Pages</th>
                        <th>Current Page</th>
                        <th>Active Date</th>
                        <th>Percentage of Book Done</th>

                    </tr>
                </thead>
                <tbody>
                    {meetings.map((meeting) => {
                        return (
                            <tr key={meeting.id}>
                                <td>{meeting.club_id}</td>
                                <td>{meeting.club_name}</td>
                                <td>{meeting.club_score}</td>
                                <td>{meeting.book_title}</td>
                                <td>{meeting.total_pages}</td>
                                <td>{meeting.current_page}</td>
                                <td>{meeting.active}</td>
                                <td>{meeting.current_page}/{meeting.total_pages}</td>

                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    )


}
