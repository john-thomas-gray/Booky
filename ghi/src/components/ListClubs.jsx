import { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'
import { NavLink } from 'react-router-dom'
import ExplorePage from './ExplorePage'
import '../App.css'

export default function ListClubs() {
    const [clubs, setClubs] = useState([]);
    const { user } = useAuthService();
    const [filteredClubs, setFilteredClubs] = useState("");


    const fetchData = async () => {
        const url = 'http://localhost:8000/api/clubs/'
        const response = await fetch(url, {credentials: "include"})
        if (response.ok) {
            const data = await response.json()
            setClubs(data)
        }
    }

    useEffect(() => {
        fetchData()


    }, []);
if (user) {
    return (
        <>
        <div><ExplorePage></ExplorePage></div>
      <div>
        <input
          className="search-box"
          placeholder="Enter a Club Name"
          value={filteredClubs}
          onChange={(event) => setFilteredClubs(event.target.value)}
        />
      </div>
      <div className='list-container'                     style={{
                        overflowY: 'auto',
                        maxHeight: '615px',
                        maxWidth: '2000px',
                    }}>
            <h1 className="m3 mt-3">Clubs</h1>
            <table className="table table-striped">
                <thead>
                    <tr>

                        <th>Club Name</th>
                        <th>Score</th>
                        <th>State</th>
                        <th>Country</th>

                    </tr>
                </thead>
                <tbody>
                      {
        clubs.length && clubs.filter((club) => {
          if (filteredClubs === "") {

            return club;
          } else if (club.name.toLowerCase().includes(filteredClubs.toLowerCase())) {

            return club;
          }

        }).map((club) => {
                        return (
                            <tr key={club.club_id} value={club.club_id} >
                                <td><NavLink aria-current="page" to={"/clubs/" + club.club_id} exact="true" className='link'>
                                        {club.name}
                                    </NavLink></td>
                                <td>{club.score}</td>
                                <td>{club.state}</td>
                                <td>{club.country}</td>

                            </tr>
                        )
                    })}
                </tbody>
            </table>
            </div>

        </>
    )
}
else{
    return(
<>
        <div><ExplorePage></ExplorePage></div>
<h1 className="m3 mt-3">You are not signed in!</h1>

</>)}}
