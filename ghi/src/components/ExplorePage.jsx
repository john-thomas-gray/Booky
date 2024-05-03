import { NavLink } from "react-router-dom"

export default function ExplorePage(){


return (<>


<div>
<h1 className="explore-header">Take a Look Around</h1></div>
                <nav>
                <div className="flexbox-container">
                <div>
                <NavLink aria-current="page" to="/clubs/list" exact="true" className='link'>
                    Clubs
                </NavLink>
                </div>
                <div>
                <NavLink aria-current="page" to="/book/book" exact="true" className='link'>
                    Books
                </NavLink>
                </div>
                </div>
                </nav>

</>)


}
