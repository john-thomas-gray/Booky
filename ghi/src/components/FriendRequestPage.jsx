import { useState, useEffect } from 'react'
import Footer from './Footer'
import useAuthService from '../hooks/useAuthService'
export default function FriendRequestPage() {
    const { user } = useAuthService()
    const [requests, setRequests] = useState([])

    const handleFriends = async (val) => {
        addFriend(val)
        addOtherFriend(val)
        deleteRequest(val)
        deleteOtherRequest(val)
    }

    const deleteRequests = async (val) => {
        deleteRequest(val)
        deleteOtherRequest(val)
    }

    const deleteRequest = async (val) => {
        const url = `https://bookingforbooky.com/api/friend/request/${user.id}/${val}`
        const fetchConfig = {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            credentials: 'include',
        }
        const response = await fetch(url, fetchConfig)
        if (response.ok) {
            fetchRequests()
        } else {
            console.error('http error:', response.status)
        }
    }

    const deleteOtherRequest = async (val) => {
        const url = `https://bookingforbooky.com/api/friend/request/${val}/${user.id}`
        const fetchConfig = {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            credentials: 'include',
        }
        const response = await fetch(url, fetchConfig)
        if (response.ok) {
            fetchRequests()
        } else {
            console.error('http error:', response.status)
        }
    }

    const addFriend = async (val) => {
        const data = {}
        data.member_id = user.id
        data.friend_id = val
        const url = 'https://bookingforbooky.com/api/friend/'
        const fetchOptions = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }
        const response = await fetch(url, fetchOptions)
        if (response.ok) {
            console.log('request went through')
        }
    }
    const addOtherFriend = async (val) => {
        const data = {}
        data.member_id = val
        data.friend_id = user.id
        const url = 'https://bookingforbooky.com/api/friend/'
        const fetchOptions = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }
        const response = await fetch(url, fetchOptions)
        if (response.ok) {
            console.log('request went through')
        }
    }

    const fetchRequests = async () => {
        const url = 'https://bookingforbooky.com/api/friend/requests'
        const response = await fetch(url, { credentials: 'include' })
        if (response.ok) {
            const data = await response.json()
            setRequests(data.filter((request) => request.user_id == user.id))
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])
    if (user) {
        return (
            <>
                <div>
                    <h1 className="explore-header">Friend Requests</h1>
                </div>
                {requests.length > 0 ? (
                    <>
                        <div>
                            <table>
                                <thead>
                                    <th>Requested By</th>
                                    <th>Accept</th>
                                    <th>Deny</th>
                                </thead>
                                <tbody>
                                    {requests.map((request) => (
                                        <tr
                                            key={request.user_id}
                                            value={request.user_id}
                                        >
                                            <td>{request.friend_name}</td>
                                            <td>
                                                <button
                                                    onClick={() =>
                                                        handleFriends(
                                                            request.friend_id
                                                        )
                                                    }
                                                >
                                                    Approve
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() =>
                                                        deleteRequests(
                                                            request.friend_id
                                                        )
                                                    }
                                                >
                                                    Deny
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div>
                        <h1>You have no requests</h1>
                    </div>
                )}

                <div>
                    <Footer></Footer>
                </div>
            </>
        )
    } else {
        return (
            <>
                <h1 className="m3 mt-3">You are not signed in!</h1>
            </>
        )
    }
}
