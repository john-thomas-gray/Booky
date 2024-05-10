// @ts-check
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthService from '../hooks/useAuthService'

export default function SignUpForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const { signup, user, error } = useAuthService()


    async function handleFormSubmit(e) {
        e.preventDefault()
        await signup({
            username,
            password,
            email,
            score: 0,
            picture_url:
                'https://i.postimg.cc/XnM4zGxH/DALL-E-2024-05-06-16-43-10-Create-a-user-logo-with-a-book-and-gambling-theme-featuring-a-silhouet.webp',
        })
    }

    if (user) {
        return <Navigate to="/" />
    }

    return (
        <>
        Sign Up
        <form onSubmit={handleFormSubmit}>
            {error && <div className="error">{error.message}</div>}
            <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
                required
            />
            <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
            />
            <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                required
                pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                title="Please enter a valid email address."
            />
            <button type="submit" disabled={!username || !password || !email}>
                Sign Up
            </button>
        </form>
        </>
    )
}
