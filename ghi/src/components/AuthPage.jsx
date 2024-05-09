import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthService from '../hooks/useAuthService'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

export default function AuthPage() {
    const [showSignUp, setShowSignUp] = useState(false)
    const { user } = useAuthService()

    const toggleForm = () => {
        setShowSignUp((prevShowSignUp) => !prevShowSignUp)
    }

    if (user) {
        return <Navigate to={`/user/${user.id}`} />
    }

    return (
        <main style={{ backgroundColor: '#8A807E' }}>
            {showSignUp ? <SignUpForm /> : <SignInForm />}
            <div>
                {showSignUp ? (
                    <div>
                        Already have an account?{' '}
                        <span
                            onClick={toggleForm}
                            style={{ cursor: 'pointer', color: 'blue' }}
                        >
                            Log In
                        </span>
                    </div>
                ) : (
                    <div>
                        Need an account?{' '}
                        <span
                            onClick={toggleForm}
                            style={{ cursor: 'pointer', color: 'blue' }}
                        >
                            Sign Up
                        </span>
                    </div>
                )}
            </div>
        </main>
    )
}
