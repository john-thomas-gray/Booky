import { NavLink } from 'react-router-dom'

export default function Nav() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-success">
            <div className="container-fluid">
                <NavLink aria-current="page" to="/" exact>
                    Home
                </NavLink>
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
