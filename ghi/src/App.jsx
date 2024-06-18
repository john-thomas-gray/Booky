// This makes VSCode check types as if you are using TypeScript
//@ts-check
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Nav from './components/Nav'
import Footer from './components/Footer'
import './App.css'

// When using environment variables, you should do a check to see if
// they are defined or not and throw an appropriate error message
// const API_HOST = import.meta.env.VITE_API_HOST
const API_HOST = 'https://booksforbooky.com'

if (!API_HOST) {
    throw new Error('VITE_API_HOST is not defined')
}

// /**
//  * This is an example of using JSDOC to define types for your component
//  * @typedef {{module: number, week: number, day: number, min: number, hour: number}} LaunchInfo
//  * @typedef {{launch_details: LaunchInfo, message?: string}} LaunchData
//  *
//  * @returns {React.ReactNode}

function App() {
    const [deleteSuccess, setDeleteSuccess] = useState([false])

    return (
        <>
            <div className="nav">
                <Nav />
            </div>
            <div className="App">
                <header className="App-header"></header>
                <Outlet context={{ deleteSuccess, setDeleteSuccess }} />
            </div>
            <div>
                <Footer></Footer>
            </div>
        </>
    )
}

export default App
