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
        <div>
            {showSignUp ? <SignUpForm /> : <SignInForm />}
            <div>
                {showSignUp ? (
                    <span>
                        <div>Already have an account?</div>
                        <button onClick={toggleForm}>Sign In</button>
                    </span>
                ) : (
                    <>
                        <div>Need an account?</div>
                        <div>
                            <button onClick={toggleForm}>Sign Up</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
