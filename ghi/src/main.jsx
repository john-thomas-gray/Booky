//@ts-check
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import SignInForm from './components/SignInForm'
import SignUpForm from './components/SignUpForm'
import App from './App'
import AuthProvider from './components/AuthProvider'
import CreateMeetingForm from './components/CreateMeetingForm'
import ListMeetings from './components/ListMeetings'
import CreateBookForm from './components/CreateBookForm'

import './index.css'
import UserList from './components/UserList'
import Home from './components/Home'
import CreateClubForm from './components/CreateClubForm'
import ClubDetailPage from './components/ClubDetailPage'
import UserPage from './components/UserPage'
import MeetingPage from './components/MeetingPage'
import AuthPage from './components/AuthPage'
import ListClubs from './components/ListClubs'
import ListBook from './components/ListBook'

const BASE_URL = import.meta.env.BASE_URL
if (!BASE_URL) {
    throw new Error('BASE_URL is not defined')
}

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <App />,
            children: [
                {
                    path: '/',
                    element: <Home />,
                },
                {
                    path: 'signup',
                    element: <SignUpForm />,
                },
                {
                    path: 'signin',
                    element: <SignInForm />,
                },
                {
                    path: 'user',
                    element: <UserList />,
                },
                {
                    path: '/clubs',
                    element: <CreateClubForm />,
                },
                {
                    path: '/clubs/list',
                    element: <ListClubs />,
                },
                {
                    path: '/meetings',
                    element: <CreateMeetingForm />,
                },
                {
                    path: '/meetings/list',
                    element: <ListMeetings />,
                },
                {
                    path: '/user/:pageOwnerID',
                    element: <UserPage />,
                },
                {
                    path: '/meetings/:meetingID',
                    element: <MeetingPage />
                },
                {
                    path: '/clubs/:clubID',
                    element: <ClubDetailPage />
                },
                {
                    path: '/book/bookform',
                    element: <CreateBookForm />
                },
                {
                    path: '/book/book',
                    element: <ListBook />
                },
                {
                    path: '/auth',
                    element: <AuthPage />
                },
            ],
        },
    ],
    {
        basename: BASE_URL,
    }
)

const rootElement = document.getElementById('root')
if (!rootElement) {
    throw new Error('root element was not found!')
}

// Log out the environment variables while you are developing and deploying
// This will help debug things
console.table(import.meta.env)

const root = ReactDOM.createRoot(rootElement)
root.render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>
)
