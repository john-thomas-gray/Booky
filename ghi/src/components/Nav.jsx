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
            <div className="container-fluid">
                <NavLink aria-current="page" to="/" exact={true}>
                    Home
                </NavLink>
                {isLoggedIn && user && (
                    <NavLink aria-current="page" to={`/user/${user.id}`} exact>
                        Userpage
                    </NavLink>
                )}
                <NavLink aria-current="page" to="/user" exact>
                    User List
                </NavLink>
                <NavLink aria-current="page" to="/clubs" exact={true}>
                    Create a Club
                </NavLink>
                <NavLink aria-current="page" to="/clubs/list" exact={true}>
                    List Clubs
                </NavLink>
                <NavLink aria-current="page" to="/meetings" exact={true}>
                    Create Meeting
                </NavLink>
                <NavLink aria-current="page" to="/meetings/list" exact={true}>
                    All Meetings
                </NavLink>
                <NavLink aria-current="page" to="/signup" exact={true}>
                    Sign Up
                </NavLink>
                <NavLink aria-current="page" to="/signin" exact={true}>
                    Sign In
                </NavLink>
            </div>
        </nav>
    )
}
