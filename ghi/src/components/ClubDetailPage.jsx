import React, { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'
import { useParams } from 'react-router-dom'

export default function ListClubs() {
    const [club, setClub] = useState([])
    const {clubID} = useParams();
    const { user } = useAuthService()
    const [hideComponent, setHideComponent] = useState(true);
    const [error, setError] = useState(null)

    const getID = (val) => (e) => {
        joinClub(val)
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
        console.log("request went through")
      };

    }

    const fetchData = async () => {
        const url = `http://localhost:8000/api/clubs/${clubID}`
        const response = await fetch(url, {credentials: "include"})
        if (response.ok) {
            const data = await response.json()
            setClub(data)
        }
    }

    useEffect(() => {
        fetchData()
        setInterval(() => {
            setHideComponent(!hideComponent);
        }, 3000);

    }, []);
if (user) {
    return (
        <>
            <h1>{club.name}</h1>

            <button className="btn btn-info" onClick={getID(club.club_id)} value={club.club_id} >Join Club</button>
        </>
    )
}
else{
    return(
<>
<h1 className="m3 mt-3">You are not signed in!</h1>
</>)}}
