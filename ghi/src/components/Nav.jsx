import { NavLink } from 'react-router-dom'
import useAuthService from '../hooks/useAuthService'

export default function Nav() {
    const { user } = useAuthService()
    return (
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <NavLink aria-current="page" to="/" exact>
                    Home
                </NavLink>
                {/* <NavLink aria-current="page" to={`/user/${user}`} exact>
                    Userpage
                </NavLink> */}
                <NavLink aria-current="page" to="/user" exact>
                    User List
                </NavLink>
                <NavLink aria-current="page" to="/clubs" exact>
                    Create a Club
                </NavLink>
                <NavLink aria-current="page" to="/clubs/list" exact>
                    List Clubs
                </NavLink>
                <NavLink aria-current="page" to="/meetings" exact>
                    Create Meeting
                </NavLink>
                <NavLink aria-current="page" to="/meetings/list" exact>
                    All Meetings
                </NavLink>
                <NavLink aria-current="page" to="/signup" exact>
                    Sign Up
                </NavLink>
            </div>
        </nav>
    )
}
