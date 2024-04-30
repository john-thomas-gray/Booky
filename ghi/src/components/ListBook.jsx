import { useState, useEffect } from 'react';

export default function ListBooks() {
    const [books, setBooks] = useState([]);

    const fetchData = async () => {
        const bookUrl = `http://localhost:8000/books/`
        const response = await fetch(bookUrl);
        if (response.ok) {
            const data = await response.json();
            setBooks(data)
        }
    }
console.log("!!!!!!",books)
    useEffect(() => {
        fetchData()
    }, [])

    return (
        <>
            <h1 className="mb-3 mt-3">Book List</h1>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Page Count</th>
                        <th>Genre</th>
                        <th>Publisher</th>
                        <th>Synopsis</th>
                        <th>Cover Img</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => {
                        return (
                            <tr key={book.id}>
                                <td>
                                    <img
                                        src={book.cover_img_url}
                                        alt={`Cover of ${book.title}`}
                                        style={{
                                            maxWidth: '100px',
                                            maxHeight: '100px',
                                        }}
                                    />
                                </td>
                                <td>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{book.page_count}</td>
                                <td>{book.genre}</td>
                                <td>{book.publisher}</td>
                                <td>{book.synopsis}</td>
                                <td>{book.cover_img_url}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    );
};