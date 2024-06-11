import { useState, useEffect } from 'react'
import ExplorePage from './ExplorePage'
import useAuthService from '../hooks/useAuthService'

export default function UserList() {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState('')
    const { user } = useAuthService()
    const grabID = (val) => {
        handleFriendRequest(val)
    }

    const handleFriendRequest = async (val) => {
        const data = {}
        data.user_id = val
        data.friend_id = user.id
        data.friend_name = user.username
        const url = `https://www.bookingforbooky.com/api/friend/request`

        const fetchConfig = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }
        const response = await fetch(url, fetchConfig)
        if (response.ok) {
            console.log('You have sent a friend request')
        }
    }

    const fetchData = async () => {
        const url = 'https://www.bookingforbooky.com/api/users/'
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setUsers(data)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])
    if (user) {
        return (
            <>
                <div>
                    <ExplorePage></ExplorePage>
                </div>

                <div>
                    <input
                        className="search-box"
                        placeholder="Enter a Username"
                        value={filteredUsers}
                        onChange={(event) =>
                            setFilteredUsers(event.target.value)
                        }
                    />
                </div>
                <div
                    className="list-container"
                    style={{
                        overflowY: 'auto',
                        maxHeight: '750px',
                        maxWidth: '2000px',
                    }}
                >
                    <h1 className="m3 mt-3">Users</h1>
                    <table className="table table-striped">
                        <thead>
                            <tr></tr>
                        </thead>
                        <tbody>
                            {users.length &&
                                users
                                    .filter((user) => {
                                        if (filteredUsers === '') {
                                            return user
                                        } else if (
                                            user.username
                                                .toLowerCase()
                                                .includes(
                                                    filteredUsers.toLowerCase()
                                                )
                                        ) {
                                            return user
                                        }
                                    })
                                    .map((user) => {
                                        return (
                                            <tr key={user.id}>
                                                <a
                                                    href={`/user/${user.id}`}
                                                    style={{
                                                        textDecoration: 'none',
                                                        color: 'inherit',
                                                    }}
                                                >
                                                    <td>
                                                        {
                                                            <img
                                                                src={
                                                                    user.picture_url
                                                                }
                                                                alt="User avatar"
                                                                style={{
                                                                    maxWidth:
                                                                        '40px',
                                                                    maxHeight:
                                                                        '40px',
                                                                }}
                                                            />
                                                        }
                                                        {user.username}{' '}
                                                    </td>
                                                    <td>{user.email}</td>
                                                    <td>{user.score}</td>
                                                    <td>
                                                        <button
                                                            onClick={() =>
                                                                grabID(user.id)
                                                            }
                                                        >
                                                            Friend Request
                                                        </button>
                                                    </td>
                                                </a>
                                            </tr>
                                        )
                                    })}
                        </tbody>
                    </table>
                </div>
            </>
        )
    } else {
        return (
            <>
                <div>
                    <ExplorePage></ExplorePage>
                </div>
                <h1 className="m3 mt-3">You are not signed in!</h1>
            </>
        )
    }
}
