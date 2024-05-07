import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExplorePage from './ExplorePage';
import Footer from './Footer';
import '../App.css'

function GoogleBooksApp() {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

                               <Link aria-current="page" to="/meetings/" state= {book} exact="true">{book.volumeInfo.title}</Link>


                                 by {book.volumeInfo.authors?.join(', ')}

                            </li>
                        ))}
                    </ul>
                </div>
                <div><Footer></Footer></div>
                </>
            );
        }



export default GoogleBooksApp;
