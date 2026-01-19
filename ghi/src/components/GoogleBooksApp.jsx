import { useState } from 'react'
import { Link } from 'react-router-dom'
import ExplorePage from './ExplorePage'
import '../App.css'
import useAuthService from '../hooks/useAuthService'
import { API_HOST } from '../config'
function GoogleBooksApp() {
    const [query, setQuery] = useState('')
    const [books, setBooks] = useState('')
    // const [isLoading, setIsLoading] = useState(false)
    // const [error, setError] = useState(null)
    const { user } = useAuthService()
    const searchBooks = async (title) => {
        const url = `${API_HOST}/getbooks/${title}`
        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setBooks(data)
        } catch (error) {
            console.error('Failed to fetch books:', error)
        }
    }
    const getBook = (book) => {
        submitBook(book)
    }
    async function submitBook(book) {
        const data = {}
        ;(data.title = String(book.volumeInfo.title)),
            (data.author = book.volumeInfo.authors[0]),
            (data.page_count = Number(book.volumeInfo.pageCount)),
            (data.genre = book.volumeInfo.categories[0]),
            (data.synopsis = book.volumeInfo.description),
            (data.cover_img_url = book.volumeInfo.imageLinks.smallThumbnail)
        const bookUrl = `${API_HOST}/book`
        const fetchConfig = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        }
        const response = await fetch(bookUrl, fetchConfig)
        if (response.ok) {
            console.log('okay')
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        searchBooks(query)
    }
    return (
        <>
            <div>
                <ExplorePage></ExplorePage>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <input
                        className="search-box"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for Books"
                        required
                    />
                    <button
                        type="submit"
                        // disabled={isLoading}
                        className="search-button"
                    >
                        {/* {isLoading ? 'Searching for Books' : 'Search'} */}
                    </button>
                </form>
                <ul>
                    {books &&
                        books.items.map((book) => (
                            <li key={book.id}>
                                {user && (
                                    <Link
                                        aria-current="page"
                                        to="/meetings/"
                                        onClick={getBook(book)}
                                        state={book}
                                        exact="true"
                                        className="link"
                                    >
                                        Create a meeting
                                    </Link>
                                )}
                                {book.volumeInfo.title} by{' '}
                                {book.volumeInfo.authors?.join(', ')}
                            </li>
                        ))}
                </ul>
            </div>
        </>
    )
}
export default GoogleBooksApp
