// @ts-check
import { useState } from 'react'

export default function CreateClubForm() {
    const [clubName, setClubName] = useState('')
    const [clubCity, setClubCity] = useState('')
    const [clubState, setClubState] = useState('')
    const [clubCountry, setClubCountry] = useState('')



    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     */
    async function handleFormSubmit(e) {
        e.preventDefault()
        const data = {};
        data.name = clubName;
        data.city = clubCity;

        data.state = clubState;
        data.country = clubCountry;





        const clubUrl = `http://localhost:8000/api/clubs/`;
        const fetchOptions = {
          method: 'post',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const clubResponse = await fetch(clubUrl, fetchOptions);
        console.log(clubResponse);

        if (clubResponse.ok) {
          setClubName('');
          setClubCity('');
          setClubState('');
          setClubCountry('');
        }

    }

    return (
        <form onSubmit={handleFormSubmit}>

            <input
                type="text"
                // name="username"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="Enter A Club Name"
            />
            <input
                type="text"
                name="password"
                value={clubCity}
                onChange={(e) => setClubCity(e.target.value)}
                placeholder="Enter Your City"
            />
            <input
                type="text"
                // name="username"
                value={clubState}
                onChange={(e) => setClubState(e.target.value)}
                placeholder="Enter Your State"
            />
            <input
                type="text"
                // name="username"
                value={clubCountry}
                onChange={(e) => setClubCountry(e.target.value)}
                placeholder="Enter Your Country"
            />
            <button type="submit">Create Club</button>
        </form>
    )
}
