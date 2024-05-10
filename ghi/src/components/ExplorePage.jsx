import { NavLink } from "react-router-dom"

export default function ExplorePage(){


return (<main style={{ backgroundColor: '#8A807E' }}>


<div>
<h1 className="explore-header">Take a Look Around</h1></div>
    <nav>
    <div className="flexbox-explore">
    <div className="explore-div">
    <NavLink aria-current="page" to="/clubs/list" exact="true" className='link'>
        Clubs
    </NavLink>
    </div>
    <div className="explore-div">
    <NavLink aria-current="page" to="/book" exact="true" className='link'>
        Books
    </NavLink>
    </div>
    <div className="explore-div">
    <NavLink aria-current="page" to="/user" exact="true" className='link'>
        Find Friends
    </NavLink>
    </div>
    </div>
    </nav>


</main>)


}
