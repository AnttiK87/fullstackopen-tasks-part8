//Authors component

//dependencies
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_BOOK, ALL_BOOKS, ALL_BOOKS_BY_GENRE, ALL_AUTHORS } from '../queries'

const NewBook = ({ setError }) => {
  //state variables
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const currentYear = new Date().getFullYear()

  // Mutation for creating a new book
  const [createBook] = useMutation(CREATE_BOOK, {
    //make these queries after adding a new book
    refetchQueries: [
      { query: ALL_BOOKS },
      { query: ALL_AUTHORS },
      ...genres.map((genre) => ({
        query: ALL_BOOKS_BY_GENRE,
        variables: { genre },
      })),
    ],
    onError: (error) => {
      //handle error
      setError(error.graphQLErrors[0].message)
    },
  })

  //function of add new button
  const submit = async (event) => {
    event.preventDefault()

    try {
      // Call the mutation to create the book
      await createBook({ variables: { title, published, genres, author } })

      // Reset the form fields
      setTitle('')
      setPublished('')
      setAuthor('')
      setGenres([])
      setGenre('')
    } catch (error) {
      //handle error...not sure if nessesary here
      setError(error.message || 'Something went wrong while submitting the form')
    }
  }

  // Add a new genre to the list
  const addGenre = () => {
    if (genre.trim() !== '' && !genres.includes(genre)) {
      setGenres(genres.concat(genre))
      setGenre('')
    }
  }

  //rendering this component
  return (
    <div style={{ maxWidth: '450px', marginLeft: '35px' }}>
      <h1>Create a New Book</h1>
      <form onSubmit={submit}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>Title: </strong>
            <input
              type="text"
              value={title}
              minLength={5}
              required
              onChange={({ target }) => setTitle(target.value)}
              style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>Author: </strong>
            <input
              type="text"
              value={author}
              minLength={4}
              required
              onChange={({ target }) => setAuthor(target.value)}
              style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>Published: </strong>
            <input
              type="number"
              min="0"
              max={currentYear}
              value={published}
              required
              onChange={({ target }) => setPublished(parseInt(target.value, 10) || '')}
              style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>Genres: </strong>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <input
                type="text"
                value={genre}
                onChange={({ target }) => setGenre(target.value)}
                style={{ flex: '1', padding: '8px' }}
              />
              <button
                type="button"
                onClick={addGenre}
                className={'buttonGrey'}
                style={{ padding: '8px 12px' }}
              >
                Add Genre
              </button>
            </div>
          </label>
          <div style={{ marginTop: '10px' }}>
            <strong>Selected genres: </strong> {genres.join(', ') || 'None'}
          </div>
        </div>

        <button type="submit" className={'buttonBlue'}>
          Create Book
        </button>
      </form>
    </div>
  )
}

export default NewBook
