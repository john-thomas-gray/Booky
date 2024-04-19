import React, { useState, useEffect } from 'react'

export default function UserList() {
    const [clubs, setClubs] = useState([])

    const fetchData = async () => {
        const url = 'http://localhost:8000/api/clubs/'
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setClubs(data)
        }
    }

    useEffect(() => {
        fetchData()
    })

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
