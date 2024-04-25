// @ts-check
import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthService from '../hooks/useAuthService'

export default function SignUpForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [score, setScore] = useState(0)
    const [picture_url, setPicture_url] = useState('')
    const { signup, user, error } = useAuthService()

    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     */
    async function handleFormSubmit(e) {
        e.preventDefault()
        await signup({ username, password, email, score, picture_url })
    }

    if (user) {
        return <Navigate to="/" />
    }

    return (
        <form onSubmit={handleFormSubmit}>
            {error && <div className="error">{error.message}</div>}
            <input
                type="text"
                // name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
            />
            <input
                type="text"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
            />
            <input
                type="text"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
            />
            <input
                type="int"
                name="score"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Enter score"
            />
            <input
                type="text"
                name="picture_url"
                value={picture_url}
                onChange={(e) => setPicture_url(e.target.value)}
                placeholder="Enter picture url"
            />
            <button type="submit">Sign Up</button>
        </form>
    )
}
