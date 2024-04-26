import useAuthService from '../hooks/useAuthService'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function UserPage() {
    const { pageOwnerID } = useParams()
    const [pageOwner, setPageOwner] = useState([])
    const [clubs, setClubs] = useState([])

    const fetchPageOwnerData = async () => {
        const url = `http://localhost:8000/api/users/${pageOwnerID}`
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setPageOwner(data)
        }
    }

    const fetchClubData = async () => {
        const url = `http://localhost:8000/api/clubs/user/${pageOwnerID}`
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setClubs(data)
        }
        console.log(clubs);
    }

    useEffect(() => {
        fetchPageOwnerData()
        fetchClubData()
    }, [])

    return (
        <>
            <div>
                <div class="userInfo">
                    <img
                        src={pageOwner.picture_url}
                        alt="User avatar"
                        style={{
                            maxWidth: '250px',
                            maxHeight: '250px',
                        }}
                    />
                    <div>{pageOwner.username}</div>
                    <div>{pageOwner.email}</div>
                </div>
            </div>
            <div class="scoreDisplay">
                <div>{pageOwner.score}</div>
            </div>
            <div class="clubList">
                <h2>{pageOwner.username}'s Clubs</h2>
                <list>
                    {clubs.map((club) => {
                        return (
                            <tr key={club.club_id}>
                                <td>{club.name}</td>
                            </tr>
                        )
                    })}
                </list>
            </div>
        </>
    )
}
