
import React, {useState, useEffect } from 'react';
import useAuthService from '../hooks/useAuthService';


function CreateMeetingForm() {
  const [clubId, setClubId] = useState('')
  const [bookTitle, setBookTitle] = useState('')
  const [active, setActive] = useState('')
  const [data, setData] = useState([])
  const {user} = useAuthService()

    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     */

  const getData = async () => {
    const url = 'http://localhost:8000/api/clubs';
    const response = await fetch(url, {credentials: "include"});

    if (response.ok){
      const data = await response.json();
      console.log("data", data)
      setData(data)
    }
  }

  useEffect(() => {
    getData();
  }, []);

  const handleClubChange = (event) => {
    setClubId(event.target.value);
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
  console.log("user", user)

if (user){
return (
  <form onSubmit={handleFormSubmit}>

    <div>this is CreateMeetingForm.jsx</div>





    <select
    type="number"
    value={clubId} onChange={handleClubChange} required name="club_id" id="club_id" className="form-select"
    placeholder="club"
    >
      {console.log("data", data)}
      {data.map(club => (
        <option key={club.club_id} value={club.club_id}>{club.name}</option>
      ))}
    </select>


    <input
    type="text"
    value={bookTitle}
    onChange={(event) => setBookTitle(event.target.value)}
    placeholder="book title"
    />

    <input
    type="date"
    value={active}
    onChange={(event) => setActive(event.target.value)}
    placeholder="active date"
    />

  <button type="submit">Create Meeting</button>
  </form>


)
}
else {
  return (
    <>
    <p> You are not signed in</p>
    </>
  )
}

}
export default CreateMeetingForm;
