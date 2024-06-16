// @ts-check
import { useState } from 'react'
import useAuthService from '../hooks/useAuthService'
import { useNavigate } from 'react-router-dom'

export default function CreateClubForm() {
    const { user } = useAuthService()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        owner_id: user.id,
        name: '',
        city: '',
        state: '',
        country: '',
    })

    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     */
    async function handleFormSubmit(e) {
        e.preventDefault()

        const clubUrl = `https://bookingforbooky.com/api/clubs/`
        const fetchOptions = {
            method: 'post',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json',
            },
        }
        const clubResponse = await fetch(clubUrl, fetchOptions)
        if (clubResponse.ok) {
            navigate('/clubs/list')
        }
    }

    const handleFormChange = (e) => {
        const value = e.target.value
        const inputName = e.target.name

        setFormData({
            ...formData,

            [inputName]: value,
        })
    }
    if (user) {
        return (
            <form onSubmit={handleFormSubmit}>
                <h1>Create a Club</h1>
                <div className="form-floating mb-3">
                    <input
                        name="name"
                        id="name"
                        required
                        type="text"
                        onChange={handleFormChange}
                        placeholder="Enter A Club Name"
                    />
                </div>

                <div className="form-floating mb-3">
                    <input
                        name="city"
                        id="city"
                        required
                        type="text"
                        onChange={handleFormChange}
                        placeholder="Enter Your City"
                    />
                </div>

                <div className="form-floating mb-3">
                    <input
                        name="state"
                        id="state"
                        required
                        type="text"
                        onChange={handleFormChange}
                        placeholder="Enter Your State"
                    />
                </div>

                <div className="form-floating mb-3">
                    <input
                        name="country"
                        id="country"
                        required
                        type="text"
                        onChange={handleFormChange}
                        placeholder="Enter Your Country"
                    />
                </div>
                <button type="submit">Create Club</button>
            </form>
        )
    } else {
        return (
            <>
                <h1 className="m3 mt-3">You are not signed in!</h1>
            </>
        )
    }
}
