import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS_BY_GENRE, ALL_BOOKS } from '../queries'

const Books = ({ show }) => {
  const text = { textAlign: 'left' }

  const [genre, setGenre] = useState('')

  const { data: allBooksData, loading: allBooksLoading, error: allBooksError } = useQuery(ALL_BOOKS)
  const {
    data: filteredBooksData,
    loading: filteredBooksLoading,
    error: filteredBooksError,
  } = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: { genre },
    skip: !genre, // Ohitetaan tämä kysely, jos genreä ei ole valittu
  })

  // Valitaan oikea lista kirjoja sen perusteella, onko genre valittu
  const books = genre ? filteredBooksData?.allBooks : allBooksData?.allBooks

  if (!show) {
    return null
  }

  const handleChange = (event) => {
    setGenre(event.target.value)
  }

  if (allBooksLoading || (genre && filteredBooksLoading)) {
    return <div>Loading...</div>
  }

  if (allBooksError || filteredBooksError) {
    return <div>Error: {allBooksError?.message || filteredBooksError?.message}</div>
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr style={text}>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Filter by genre</h2>
      <form>
        <label>
          Select genre:
          <select value={genre} onChange={handleChange}>
            <option value="">-- Select genre --</option>
            {[...new Set(allBooksData.allBooks.flatMap((b) => b.genres))].map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>
      </form>
    </div>
  )
}

export default Books
