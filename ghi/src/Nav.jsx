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
            </div>
        </nav>
    )
}
