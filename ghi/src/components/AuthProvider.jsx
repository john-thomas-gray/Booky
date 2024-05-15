// @ts-check
import { createContext, useEffect, useState } from 'react'
import { authenticate } from '../services/authService'

/**
 * @typedef {import('../types').UserDataResponse} UserDataResponse
 * @typedef {import('../types').AuthContextType} AuthContextType
 */

/** Note: The TypeScript Language Server doesn't like this jsdoc for some
 * reason. As of 02-19-2024 this produces a type error
 * @type {React.Context<AuthContextType|null>}
 */
export const AuthContext = createContext(null)

/** AuthProvider
 * This uses a ReactContext to hold the user login information
 *
 * Wrap this around your entire application, and then you can use the `useAuthentication`
 * hook to grab the user info or a boolean saying if the user is logged in
 *
 * @param {React.PropsWithChildren} children
 * @return {React.ReactNode}
 *
 */
export default function AuthProvider({ children }) {
    /**
     * @type {[UserDataResponse | undefined, React.Dispatch<React.SetStateAction<UserDataResponse | undefined>>]}
     */
    const [user, setUser] = useState()
    /**
     * @type {[Error | undefined, React.Dispatch<React.SetStateAction<Error | undefined>>]}
     */
    const [error, setError] = useState()
    const [isLoading, setIsLoading] = useState(true)

    // This calls our backend once when this component
    // renders to populate the user information
    // If the user is logged in
    useEffect(() => {
        authenticate().then((result) => {
            // If authenticate returns an error,
            // Set the user to undefined
            if (result instanceof Error) {
                setUser(undefined)
                setIsLoading(false)
                return
            }
            // Otherwise, set the user to the result we got from the backend
            setUser(result)
            setIsLoading(false)
        })
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                isLoading,
                setIsLoading,
                error,
                setError,
                // This is a helper property you can check in components
                // to determine if a user is logged in or not
                isLoggedIn: user ? true : false,
            }}
        >
            {isLoading ? <div>loading...</div> : children}
        </AuthContext.Provider>
    )
}
