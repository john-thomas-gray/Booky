import React, { useState, useEffect } from 'react'
import ExplorePage from './ExplorePage';
import Footer from './Footer';
export default function UserList() {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState("");

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
        <div><ExplorePage></ExplorePage></div>

        <div>
        <input
          className="search-box"
          placeholder="Enter a Username"
          value={filteredUsers}
          onChange={(event) => setFilteredUsers(event.target.value)}
        />
        </div>
              <div className='list-container'>
            <h1 className="m3 mt-3">Users</h1>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Score</th>
                        <th>Profile Picture</th>
                    </tr>
                </thead>
                <tbody>
                    {
        users.length && users.filter((user) => {
          if (filteredUsers === "") {

            return user;
          } else if (user.username.toLowerCase().includes(filteredUsers.toLowerCase())) {

            return user;
          }

        }).map((user) => {
                        return (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.score}</td>
                                <td>
                                    {
                                        <img
                                            src={user.picture_url}
                                            alt="User avatar"
                                            style={{
                                                maxWidth: '100px',
                                                maxHeight: '100px',
                                            }}
                                        />
                                    }
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            </div>
            <div><Footer></Footer></div>
        </>
    )
}
