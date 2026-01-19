import { useState } from 'react'
import GoogleBooksApp from './GoogleBooksApp'
import { API_HOST } from '../config'

function CreateBookForm() {
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [pageCount, setPageCount] = useState('')
    const [genre, setGenre] = useState('')
    const [publisher, setPublisher] = useState('')
    const [synopsis, setSynopsis] = useState('')
    const [coverImgUrl, setCoverImgUrl] = useState('')

    async function handleFormSubmit(event) {
        event.preventDefault()
        const data = {}
        ;(data.title = title),
            (data.author = author),
            (data.page_count = Number(pageCount)),
            (data.genre = genre),
            (data.publisher = publisher),
            (data.synopsis = synopsis),
            (data.cover_img_url = coverImgUrl)

        const bookUrl = `${API_HOST}/book`
        const fetchConfig = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        }

        const response = await fetch(bookUrl, fetchConfig)
        if (response.ok) {
            setTitle('')
            setAuthor('')
            setPageCount('')
            setGenre('')
            setPublisher('')
            setSynopsis('')
            setCoverImgUrl('')
        } else {
            console.error('Failed to create book')
        }
    }

    return (
        <div>
            {' '}
            <GoogleBooksApp />
            <form onSubmit={handleFormSubmit}>
                <div>This is CreateBookForm.jsx</div>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Book Title"
                    required
                />
                <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author"
                    required
                />
                <input
                    type="number"
                    value={pageCount}
                    onChange={(e) => setPageCount(e.target.value)}
                    placeholder="Number of Pages"
                />
                <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    required
                    className="form-select"
                >
                    <option value="">Select a Genre</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-fiction">Non-fiction</option>
                    <option value="Science Fiction">Science Fiction</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Biography">Biography</option>
                </select>
                <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Publisher"
                />
                <input
                    type="text"
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    placeholder="Synopsis"
                />
                <input
                    type="text"
                    value={coverImgUrl}
                    onChange={(e) => setCoverImgUrl(e.target.value)}
                    placeholder="Cover Img URL"
                />

                <button type="submit">Create Book</button>
            </form>
        </div>
    )
}
export default CreateBookForm
