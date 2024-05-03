import React, { useState, useEffect } from 'react'
import { NavLink, useParams, Link, useOutletContext } from 'react-router-dom'
import useAuthService from '../hooks/useAuthService'

export default function ListMeetings(){
const [meetings, setMeetings] = useState([])
const {meetingId} = useParams()
const { user } = useAuthService()
const [club, setClub] = useState("")
const {deleteSuccess, setDeleteSuccess} = useOutletContext()
const fetchData = async () => {
    const url = 'http://localhost:8000/api/meeting/'

    const response = await fetch(url)
    if (response.ok) {
        const data = await response.json()
        setMeetings(data)
        const club_id = data.club_id
        await fetchClub(club_id)
    }
}
console.log(deleteSuccess, "deleteSucess111111111")

const fetchClub = async (club_id) => {
    const url = `http://localhost:8000/api/clubs/${club_id}`
    const response = await fetch(url, {credentials: "include"})
        if (response.ok) {
            const data = await response.json()
            setClub(data)
        }
        console.log("rresponse", response)
};


useEffect(() => {
    fetchData();
}, [deleteSuccess])

 return (
        <>
            <h1 className="m3 mt-3">Meetings</h1>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Book Title</th>
                        <th>Active Date</th>
                        <th>Club ID</th>
                        <th>
                            {club.owner_id}
                        </th>

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
                                    {meeting.club_id}
                                </td>

                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    );
}
