// This makes VSCode check types as if you are using TypeScript
//@ts-check
import { useState, useEffect } from 'react'
import { Outlet, BrowserRouter, Routes, Route } from 'react-router-dom'

import ErrorNotification from './components/ErrorNotification'
import Construct from './components/Construct'
import SignUpForm from './components/SignUpForm'
import Nav from './components/Nav'

import './App.css'
import './userpage.css'


// When using environment variables, you should do a check to see if
// they are defined or not and throw an appropriate error message
const API_HOST = import.meta.env.VITE_API_HOST

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
        <div className='nav' style={{ backgroundColor: '#FAEBD7'}}>
            <Nav />
        </div>
        <div className="App" style={{ backgroundColor: '#8A807E' }}>
            <header className="App-header">

            </header>
            <Outlet context={{deleteSuccess, setDeleteSuccess}}/>
        </div>
        </>
    )
}

export default App
