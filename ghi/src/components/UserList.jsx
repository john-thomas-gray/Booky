import React, { useState, useEffect } from 'react'

export default function UserList() {
    const [users, setUsers] = useState([])

    const fetchData = async () => {
        const url = 'http://localhost:8000/api/users/'
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setUsers(data)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <>
            <h1 className="m3 mt-3">Users</h1>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Avatar</th>
                        <th>Bio</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => {
                        return (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.first_name}</td>
                                <td>{user.last_name}</td>
                                <td>
                                    {
                                        <img
                                            src={user.avatar_url}
                                            alt="User avatar"
                                            style={{
                                                maxWidth: '100px',
                                                maxHeight: '100px',
                                            }}
                                        />
                                    }
                                </td>
                                <td>{user.bio}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
}
