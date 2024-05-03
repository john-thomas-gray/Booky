import React, { useState, useEffect } from 'react'
import { NavLink, useParams } from 'react-router-dom'

export default function ListMeetings(){
const [meetings, setMeetings] = useState([])
const {meetingId} = useParams()

const fetchData = async () => {
    const url = 'http://localhost:8000/api/meeting/'

    const response = await fetch(url)
    if (response.ok) {
        const data = await response.json()
        setMeetings(data)
    }
}

const deleteMeeting = async (id) => {
    const url = `http://localhost:8000/api/meeting/${id}`;
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
      fetchData();
    } else {
      console.error('http error:', response.status);
    }

    };



useEffect(() => {
    fetchData()
}, [])

 return (
        <>
            <h1 className="m3 mt-3">Meetings</h1>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Book Title</th>
                        <th>Active Date</th>
                        <th>Delete Meeting</th>

                    </tr>
                </thead>
                <tbody>
                    {meetings.map((meeting) => {
                        return (
                            <tr key={meeting.id}>
                                <td>
                                    <NavLink aria-current="page" to={"/meetings/" + meeting.id} exact="true">
                                    {meeting.book_title}
                                    </NavLink>
                                </td>
                                <td>{meeting.active}</td>
                                <td>
                                    <button onClick={() => deleteMeeting(meeting.id)}>Delete</button>
                                </td>

                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    );
}
