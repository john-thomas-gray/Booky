import React, { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'

export default function ListClubs() {
    const [clubs, setClubs] = useState([])
    const { user } = useAuthService()


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
                        <th>{user.username}</th>
                        <th>Club Name</th>
                        <th>State</th>
                        <th>Country</th>

                    </tr>
                </thead>
                <tbody>
                    {clubs.map((club) => {
                        return (
                            <tr key={club.id}>
                                <td>{club.name}</td>
                                <td>{club.state}</td>
                                <td>{club.country}</td>
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
