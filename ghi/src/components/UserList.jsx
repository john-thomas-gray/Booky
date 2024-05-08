import React, { useState, useEffect } from 'react'
import ExplorePage from './ExplorePage';
import Footer from './Footer';
import useAuthService from '../hooks/useAuthService'

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState("");
    const {user} = useAuthService();
    // const [friendID, setFriendID] = useState('');
    const grabID = (val) => {
      handleFriendRequest(val)
    }



    const handleFriendRequest = async (val) => {
        const data = {};
        data.user_id = val
        data.friend_id = user.id
        data.friend_name = user.username
        const url = `http://localhost:8000/api/friend/request`

        const fetchConfig = {
          method: "post",
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: "include"
        };
        const response = await fetch(url, fetchConfig)

        if (response.ok) {
          console.log('request went through')
        }


    }
    async function handleFormSubmit(event){
    event.preventDefault()
    const data = {};
    data.club_id = Number(clubId);
    data.book_title = bookTitle;
    data.active = active;
    console.log("data", data)

    const meetingUrl = 'http://localhost:8000/api/meeting/create/'
    const fetchConfig = {
          method: "post",
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: "include"
        };
      const response = await fetch(meetingUrl, fetchConfig);
      console.log("response", response)


      if (response.ok) {
        setClubId('');
        setBookTitle('');
        setActive('');
      }
  }


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
if(user){
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
                                <td>{user.username}   <button onClick={() => grabID(user.id)}>Friend Request</button></td>
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
else {
     return(
<>
        <div><ExplorePage></ExplorePage></div>
<h1 className="m3 mt-3">You are not signed in!</h1>
            <div><Footer></Footer></div>
</>)}}
