import React, { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'
import { NavLink, useParams } from 'react-router-dom'
import { TextField, Autocomplete } from '@mui/material'

export default function ListClubs() {
    const [clubs, setClubs] = useState([]);
    const { user } = useAuthService();
    const {clubID} = useParams();
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
      <div>
        <input
          className="search-box"
          placeholder="Enter a Club Name"
          value={filteredClubs}
          onChange={(event) => setFilteredClubs(event.target.value)}
        />
      </div>
            <h1 className="m3 mt-3" >Clubs</h1>
            <table className="table table-striped">
                <thead>
                    <tr>

                        <th>Club Name</th>
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
                                <td><NavLink aria-current="page" to={"/clubs/" + club.club_id} exact="true">
                                        {club.name}
                                    </NavLink></td>
                                <td>{club.state}</td>
                                <td>{club.country}</td>

                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
}
else{
    return(
<>
<h1 className="m3 mt-3">You are not signed in!</h1>
</>)}}
