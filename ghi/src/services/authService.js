// @ts-check
import { tryFetch } from '../utils'
import { API_HOST } from '../config'

export const baseUrl = API_HOST
if (!baseUrl) {
    throw new Error('VITE_API_HOST was not defined')
}

/**
 * @typedef {import('../types').UserDataResponse} UserDataResponse
 * @typedef {import('../types').SignInRequest} SignInRequest
 * @typedef {import('../types').SignUpRequest} SignUpRequest
 */

/* -- Errors as Values --
    The pattern used in these functions is called Errors as values.
    You can see these functions do not *throw* new errors, but instead
    return them.  This means instead of using try catch when we call them
    we can instead use `instanceof`.

    This allows you to keep the happy path to the left, which makes
    the code more readable than try catch

    Example:
    const result = await signin(...)
    if (result instanceof Error) {
        // handle the error
    }
    // handle the happy path
*/

/** This calls our authenticate method on the backend.
 * The purpose of this method is to grab the user information
 * and determine if the user is logged in or not (they have a valid cookie)
 * @return {Promise<UserDataResponse | Error>}
 */
export async function authenticate() {
    const url = `${baseUrl}/api/auth/authenticate`
    // Call our helper method 'tryFetch' which handles the try catching
    // This is the only function in here which uses this, as an example
    // of how you can build a helper function that gets rid of the
    // need to use try...catch with fetch.
    // As an exercise, read through tryFetch and see if you can
    // understand how it works and then perhaps try refactoring all
    // the fetches in this app to use the utility
    //
    // result will return either an object containign the user data or an JS Error object
    /**
     * @type {UserDataResponse | Error}
     */
    const result = await tryFetch(url, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    // Check to see if we got an error while calling the API
    // We can do this instead of try...catch because of the tryFetch helper
    if (result instanceof Error) {
        return result
    }

    // Check if the result has the required properties
    if (typeof result.id !== 'number' || typeof result.username !== 'string') {
        return new Error('Invalid user data')
    }

    // Return the parsed Data
    return result
}

/**
 * @param {SignUpRequest} signUpRequest
 * @return {Promise<UserDataResponse | Error>}
 */
export async function signup(signUpRequest) {
    const url = `${baseUrl}/api/auth/signup`
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(signUpRequest),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if (!res.ok) {
            throw new Error("Couldn't sign up")
        }
        /**
         * @type {UserDataResponse}
         */
        const result = await res.json()

        if (
            typeof result.id !== 'number' ||
            typeof result.username !== 'string'
        ) {
            throw new Error('Invalid user data')
        }

        return result
    } catch (e) {
        if (e instanceof Error) {
            return e
        }
        return new Error('Something Unknown Happened')
    }
}

/**
 * @param {SignInRequest} signInRequest
 * @return {Promise<UserDataResponse | Error>}
 */
export async function signin(signInRequest) {
    const url = `${baseUrl}/api/auth/signin`
    // We must try catch around `fetch` because
    // fetch will throw errors on network errors
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(signInRequest),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        // This checks for non-200 HTTP responses,
        // because fetch does not throw an Error on those
        if (!res.ok) {
            return new Error('Sign in failed')
        }
        /**
         * @type {UserDataResponse}
         */
        const result = await res.json()
        // This is validating our JSON response to make sure
        // It's got the correct types.
        if (
            typeof result.id !== 'number' ||
            typeof result.username !== 'string'
        ) {
            return new Error('Invalid user data')
        }
        return result
    } catch (e) {
        // There's actually no guarantee that e will be an error
        // object in JavaScript, so doing an explicit check is better
        if (e instanceof Error) {
            return e
        }
        // If we got down here, something really unexpected happened
        return new Error('Something unknown happened.')
    }
}

/**
 * @return {Promise<Error | undefined>}
 */
export async function signout() {
    const url = `${baseUrl}/api/auth/signout`
    try {
        const res = await fetch(url, {
            method: 'DELETE',
            credentials: 'include',
        })
        if (!res.ok) {
            throw new Error('Failed to logout')
        }
    } catch (e) {
        if (e instanceof Error) {
            return e
        }
        return new Error('Something Unknown Happened')
    }
}
