import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExplorePage from './ExplorePage';
import Footer from './Footer';
import '../App.css'
import useAuthService from '../hooks/useAuthService'
function GoogleBooksApp() {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const {user} = useAuthService();
        const searchBooks = async (title) => {
        const url = `http://localhost:8000/getbooks/${title}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setBooks(data)
            } catch (error) {
                console.error('Failed to fetch books:', error);
            }
            }
        const getBook = (book) => (e) => {
            submitBook(book)
        };
        async function submitBook(book) {
        const data = {};
            data.title = String(book.volumeInfo.title), data.author = book.volumeInfo.authors[0], data.page_count = Number(book.volumeInfo.pageCount), data.genre = book.volumeInfo.categories[0],
            data.synopsis = book.volumeInfo.description, data.cover_img_url = book.volumeInfo.imageLinks.smallThumbnail
        console.log("Submitting data", data);
        const bookUrl = 'http://localhost:8000/book';
        const fetchConfig = {
            method: "POST",
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        };
        const response = await fetch(bookUrl, fetchConfig);
        console.log("response", response)
        if (response.ok) {
        console.log("Sucess!")
        }}
            const handleSubmit = (event) => {
                event.preventDefault();
                searchBooks(query)
                }
            return (
                <>
                        <div><ExplorePage></ExplorePage></div>
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
                        <button type="submit" disabled={isLoading} className="search-button">
                            {isLoading ? 'Searching for Books' : 'Search'}
                        </button>
                    </form>
                    {error && <div>{error}</div>}
                    <ul>
                        {books && books.items.map(book => (
                            <li key={book.id}>
                            {user &&
                               <Link aria-current="page" to="/meetings/" onClick={getBook(book)} state= {book} exact="true" className='link'>Create a meeting</Link> }
                                {book.volumeInfo.title} by {book.volumeInfo.authors?.join(', ')}
                            </li>
                        ))}
                    </ul>
                </div>
                <div><Footer></Footer></div>
                </>
            );
        }
export default GoogleBooksApp;