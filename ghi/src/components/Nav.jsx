import { NavLink } from 'react-router-dom'
import useAuthService from '../hooks/useAuthService'

export default function Nav() {
    const { user } = useAuthService()
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <NavLink aria-current="page" to="/" exact="true">
                    Home
                </NavLink>
                {/* <NavLink aria-current="page" to={`/user/${user}`} exact>
                    Userpage
                </NavLink> */}
                <NavLink aria-current="page" to="/user" exact="true">
                    User List
                </NavLink>
                <NavLink aria-current="page" to="/clubs" exact="true">
                    Create a Club
                </NavLink>
                <NavLink aria-current="page" to="/clubs/list" exact="true">
                    List Clubs
                </NavLink>
                <NavLink aria-current="page" to="/meetings" exact="true">
                    Create Meeting
                </NavLink>
                <NavLink aria-current="page" to="/meetings/list" exact="true">
                    All Meetings
                </NavLink>
                <NavLink aria-current="page" to="/signup" exact="true">
                    Sign Up
                </NavLink>
            </div>
        </nav>
    )
}
