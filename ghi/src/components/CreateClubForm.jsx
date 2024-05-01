// @ts-check
import { useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService'


export default function CreateClubForm() {
  const [users, setUsers] = useState([])
  const { user } = useAuthService()
  const [formData, setFormData] = useState({
    owner_id: user.id,
    name: '',
    city: '',
    state: '',
    country: '',

  })
    const fetchData = async () => {
        const url = 'http://localhost:8000/api/users/'
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            setUsers(data)
        }
    }
  useEffect(() => {
    fetchData();
  }, []);

    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     */
    async function handleFormSubmit(e) {
        e.preventDefault()

        console.log(formData)

        const clubUrl = `http://localhost:8000/api/clubs/`;
        const fetchOptions = {
          method: 'post',
          body: JSON.stringify(formData),
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const clubResponse = await fetch(clubUrl, fetchOptions);
        console.log(clubResponse);

        if (clubResponse.ok) {
            setFormData ({
                owner_id: user.id,
                name: '',
                city: '',
                state: '',
                country: '',

            });
        }

    }

    const handleFormChange = (e) => {
    const value = e.target.value;
    const inputName = e.target.name;

    setFormData({
      ...formData,

      [inputName]: value
    });
  }
if (user) {
    return (
        <form onSubmit={handleFormSubmit}>

            <h1>Create a Club</h1>
            <div className="form-floating mb-3">
            <input
                name='name'
                id='name'
                required type="text"
                onChange={handleFormChange}
                placeholder="Enter A Club Name"
            />

            </div>


            <div className="form-floating mb-3">
            <input
                name='city'
                id='city'
                required type="text"
                onChange={handleFormChange}
                placeholder="Enter Your City"
            />

            </div>


            <div className="form-floating mb-3">
            <input
                name='state'
                id = 'state'
                required type="text"
                onChange={handleFormChange}
                placeholder="Enter Your State"
            />

            </div>


            <div className="form-floating mb-3">
            <input
                name='country'
                id = 'country'
                required type="text"
                onChange={handleFormChange}
                placeholder="Enter Your Country"
            />

            </div>
            <button type="submit">Create Club</button>
        </form>
    )
}
else{
    return(
<>
<h1 className="m3 mt-3">You are not signed in!</h1>
</>)}}
