import { useState, useEffect } from 'react'

export default function ListClubMembers() {
    const [clubMembers, setClubMembers] = useState([])

    const fetchData = async () => {
        const url = 'http://localhost:8000/api/users/club/${club_id}/'
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setClubMembers(data)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <>
            <h1 className="m3 mt-3">Club Members</h1>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Avatar</th>
                        <th>Username</th>
                    </tr>
                </thead>
                <tbody>
                    {clubMembers.map((member) => {
                        return (
                            <tr key={member.id}>
                                <td>
                                    {
                                        <img
                                            src={member.avatar_url}
                                            alt="User avatar"
                                            style={{
                                                maxWidth: '100px',
                                                maxHeight: '100px',
                                            }}
                                        />
                                    }
                                </td>
                                <td>{member.username}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
}
