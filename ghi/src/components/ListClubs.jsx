import React, { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'

export default function ListClubs() {
    const [clubs, setClubs] = useState([])
    const [clubId, setClubId] = useState('')
    const { user } = useAuthService()
    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     */
    const joinClub = async () => {
        const data = {};
        data.member_id = user.id
        data.club_id = clubId
        const membersUrl = `http://localhost:8000/api/users/club/${clubId}/`
        const fetchConfig = {
          method: "post",
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',

          },
        };
      const response = await fetch(membersUrl,  fetchConfig);
      if (response.ok){
        console.log("response went through")
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
                            <tr key={club.club_id} value={club.club_id}>
                                <td>{club.name}</td>
                                <td>{club.state}</td>
                                <td>{club.country}</td>
                                <td><button className="btn btn-info" onClick={joinClub} >Join Club</button></td>
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
</>)}

}
