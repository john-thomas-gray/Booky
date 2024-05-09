import { NavLink } from 'react-router-dom'
import useAuthService from '../hooks/useAuthService'

export default function Nav() {
    const { user, isLoggedIn } = useAuthService()

    const signOut = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/signout', {
                method: 'DELETE',
                credentials: 'include',
            })
            // Check if the response indicates successful signout
            if (response.ok) {
                console.log('Signed out successfully.')
                // Redirect to the home page
                window.location.href = '/'
            } else {
                console.error('Failed to sign out:', response.statusText)
            }
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="flexbox-container align-items-center">
                <div>
                    <img
                        src="https://i.postimg.cc/qpzNXTt4/image.png"
                        alt="Logo"
                        style={{ width: '60px', height: '60px' }}
                        className="logo"
                    />
                </div>
                <div>
                    {!isLoggedIn && !user && (
                        <NavLink
                            aria-current="page"
                            to="/"
                            exact="true"
                            className="link"
                        >
                            Home
                        </NavLink>
                    )}
                </div>
                {isLoggedIn && user && (
                    <div>
                        <NavLink
                            aria-current="page"
                            to={`/user/${user.id}`}
                            exact="true"
                            className="link"
                        >
                            Home
                        </NavLink>
                    </div>
                )}
                {/* <div>
                    <NavLink
                        aria-current="page"
                        to="/meetings"
                        exact="true"
                        className="link"
                    >
                        Create Meeting
                    </NavLink>
                </div> */}
                <div>
                    <NavLink
                        aria-current="page"
                        to="/meetings/list"
                        exact="true"
                        className="link"
                    >
                        All Meetings
                    </NavLink>
                </div>
                <div>
                    <NavLink
                        aria-current="page"
                        to="/explore"
                        exact="true"
                        className="link"
                    >
                        Explore
                    </NavLink>
                </div>
                {!isLoggedIn && !user && (
                    <div>
                        <NavLink
                            aria-current="page"
                            to="/auth"
                            exact="true"
                            className="link"
                        >
                            Log In / Sign Up
                        </NavLink>
                    </div>
                )}
                {isLoggedIn && (
                    <span
                        onClick={signOut}
                        style={{ cursor: 'pointer' }}
                        className="link"
                    >
                        Sign Out
                    </span>
                )}
            </div>
        </nav>
    )
}
