import { NavLink } from 'react-router-dom';

function Nav() {
  return (
    <>
    <p>Tell me your deepest, darkest secrets</p>
    <nav className="navbar navbar-expand-lg navbar-light bg-info">
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link active" aria-current="page" to="/clubs">Create Club</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link active" aria-current="page" to="/meetings">Create Meeting</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link active" aria-current="page" to="/meetings/list">All Meetings</NavLink>
            </li>

          </ul>
        </div>
      </div>
    </nav>
    </>
  )
}

export default Nav;
