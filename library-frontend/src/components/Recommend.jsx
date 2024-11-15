import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS_BY_GENRE, CURRENT_USER } from '../queries'

const Recommended = ({ show }) => {
  const text = { textAlign: 'left' }

  const { data: currentUserData, loading: currentUserLoading } = useQuery(CURRENT_USER)
  const [genre, setGenre] = useState(null)

  useEffect(() => {
    if (currentUserData?.me?.favoriteGenre) {
      setGenre(currentUserData.me.favoriteGenre)
    }
  }, [currentUserData])

  const { data: filteredBooksData, loading: filteredBooksLoading } = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: { genre },
    skip: !genre,
  })

  if (currentUserLoading || filteredBooksLoading) {
    return <div>Loading...</div>
  }

  const books = filteredBooksData?.allBooks || []

  if (!show) {
    return null
  }

  return (
    <div>
      <h2>Recommendations</h2>
      <div>
        List of books in your favorite genre: <b>{genre}</b>
      </div>
      <br></br>

      <table>
        <tbody>
          <tr style={text}>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.length > 0 ? (
            books.map((b) => (
              <tr key={b.title}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No books found in this genre.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended
