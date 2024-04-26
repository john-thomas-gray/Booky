import React, { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'


export default function ListClubs() {
    const [clubs, setClubs] = useState([])
    const { user } = useAuthService()

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
      const response = await fetch(membersUrl,  fetchConfig);
      if (response.ok){
        console.log("request went through")
      }
    }

    const fetchData = async () => {
        const url = 'http://localhost:8000/api/clubs/'
        const response = await fetch(url, {credentials: "include"})
        if (response.ok) {
            const data = await response.json()
            setClubs(data)
        }
    }

    useEffect(() => {
        fetchData()
    }, []);
if (user) {
    return (
        <>
            <h1 className="m3 mt-3">Clubs</h1>
            <table className="table table-striped">
                <thead>
                    <tr>

                        <th>Club Name</th>
                        <th>State</th>
                        <th>Country</th>

                    </tr>
                </thead>
                <tbody>
                    {clubs.map((club) => {
                        return (
                            <tr key={club.club_id} value={club.club_id} >
                                <td>{club.name}</td>
                                <td>{club.state}</td>
                                <td>{club.country}</td>
                                <td><button className="btn btn-info" onClick={getID(club.club_id)} value={club.club_id} >Join Club</button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
}
else{
    return(
<>
<h1 className="m3 mt-3">You are not signed in!</h1>
</>)}}
