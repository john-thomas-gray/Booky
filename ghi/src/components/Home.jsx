import { useState } from 'react'
import bookyLogo from '../../images/booky-logo.png'
import { Navigate } from 'react-router-dom'
import useAuthService from '../hooks/useAuthService'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

export default function Home() {
    const [showSignUp, setShowSignUp] = useState(false)
    const { user } = useAuthService()

    const toggleForm = () => {
        setShowSignUp((prevShowSignUp) => !prevShowSignUp)
    }

    if (user) {
        return <Navigate to={`/user/${user.id}`} />
    }
    return (
        <section className="home">
            <img
                className="home-logo"
                src={bookyLogo}
                alt="In a logo, books and a racetrack surround the name 'Booky'."
            />
            <h2 className="home-title">Raise the stakes of your book club!</h2>
            <div className="home-card">
                {showSignUp ? <SignUpForm /> : <SignInForm />}
                <div className="home-toggle">
                    {showSignUp ? (
                        <div>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={toggleForm}
                                className="home-link"
                            >
                                Log In
                            </button>
                        </div>
                    ) : (
                        <div>
                            Need an account?{' '}
                            <button
                                type="button"
                                onClick={toggleForm}
                                className="home-link"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
