import React, { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'
import { useParams } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import Footer from './Footer'


export default function ClubDetailPage() {
    const [club, setClub] = useState("")
    const {clubID} = useParams();
    const { user } = useAuthService()
    const [hideComponent, setHideComponent] = useState(true);
    const [error, setError] = useState(null)
    const [members, setMembers] = useState([])
    const [meetings, setMeetings] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentMeetings = meetings.filter(
            (meeting) => new Date(meeting.active) > new Date()
        )

    const getID = (val) => (e) => {
        joinClub(val)
    };

    const getMeetingId = (meetingId) => (e) => {
        joinMeeting(meetingId)
    };

    const joinClub = async (val) => {
        const data = {};
        data.member_id = user.id
        data.club_id = val
        const membersUrl = `http://localhost:8000/api/users/club/${val}/`
        const fetchConfig = {
          method: "post",
          body: JSON.stringify(data),
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',


          },

        };
      const response = await fetch(membersUrl,  fetchConfig).catch(error => setError(error))
      if (response.ok){
        fetchMembers()
      };

    }

    const joinMeeting = async (meetingId) => {
        const data = {};
        data.meeting_id = meetingId
        data.attendee_id = user.id
        console.log(data)
        const membersUrl = `http://localhost:8000/api/meeting/${meetingId}/`
        const fetchConfig = {
          method: "post",
          body: JSON.stringify(data),
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',


          },

        };

      const response = await fetch(membersUrl,  fetchConfig).catch(error => setError(error))
      if (response.ok){
        console.log("request went through")
      };

    }
    const fetchMembers = async () => {
        const url = `http://localhost:8000/api/users/club/${clubID}`
        const response = await fetch(url, {credentials: "include"})
        if (response.ok) {
            const data = await response.json()
            setMembers(data)
        }
    }

    const fetchMeetings = async () => {
        const url = `http://localhost:8000/api/meeting/club/${clubID}`
        const response = await fetch(url, {credentials: "include"})
        if (response.ok) {
            const data = await response.json()
            setMeetings(data)
        }
    }

    const fetchClub = async () => {
        const url = `http://localhost:8000/api/clubs/${clubID}`
        const response = await fetch(url, {credentials: "include"})
        if (response.ok) {
            const data = await response.json()
            setClub(data)
        }
    }

    useEffect(() => {
        fetchClub();
        fetchMembers();
        fetchMeetings();
        setInterval(() => {
            setHideComponent(!hideComponent);
        }, 2500);

    }, []);


if (user) {
    return (
        <>
            {error && hideComponent && <h1 className="m3 mt-3">You are already in this club!</h1>}
            <h1 className='explore-header'>{club.name}</h1>
            <button className="btn btn-info" onClick={getID(club.club_id)}>Join Club</button>

            <table className="table table-striped">
                <thead>
                    <tr>

                        <th>Members</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member) => {
                        return (
                            <tr key={member.id}>
                                <td>{member.username}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <h1>Meetings</h1>
                {user.id == club.owner_id &&

                    <>
                    <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="container-fluid">
                        <NavLink aria-current="page" to="/book" exact="true" className='link'>
                            Create Meeting
                        </NavLink>
                    </div>
                    </nav>
                    </>
                }
            <table>
                <thead>
                    <tr>
                        <th>Book Title</th>
                        <th>Meeting Date</th>
                    </tr>
                </thead>
                <tbody>
                    {meetings.map((meeting) => {
                        return (
                            <tr key={meeting.book_title}>
                                <td><NavLink aria-current="page" to={"/meetings/" + meeting.id} exact="true" className='link'>{meeting.book_title}</NavLink></td>
                                <td>{meeting.active}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <Footer/>
        </>
    )
}
else{
    return(
<>
<h1 className="m3 mt-3">You are not signed in!</h1>
</>)}}
