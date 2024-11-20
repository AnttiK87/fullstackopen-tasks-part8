//recommended component

//dependencies
import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS_BY_GENRE, CURRENT_USER } from '../queries'

const Recommended = () => {
  //get current user data
  const { data: currentUserData, loading: currentUserLoading } = useQuery(CURRENT_USER)
  //state variables
  const [genre, setGenre] = useState(null)

  //set current users favorite genre to variable
  useEffect(() => {
    if (currentUserData?.me?.favoriteGenre) {
      setGenre(currentUserData.me.favoriteGenre)
    }
  }, [currentUserData])

  //get books filtered by favorite genre
  const { data: filteredBooksData, loading: filteredBooksLoading } = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: { genre },
    skip: !genre,
  })

  //Showing loading screen if data is being loaded
  if (currentUserLoading || filteredBooksLoading) {
    return <div>Loading...</div>
  }

  //setting empty array or filtered books to variable
  const books = filteredBooksData?.allBooks || []

  //rendering this component
  return (
    <div style={{ maxWidth: '750px', marginLeft: '35px' }}>
      <h1
        style={{
          marginBottom: '5px',
        }}
      >
        Recommendations
      </h1>
      <div>
        List of books in your favorite genre: <b>{genre}</b>
      </div>
      <br></br>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
          backgroundColor: '#f9f9f9',
          marginBottom: '50px',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'left',
            }}
          >
            <th style={{ padding: '12px' }}>title</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>author</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>published</th>
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((b, index) => (
              <tr
                key={b.title}
                style={{
                  borderBottom: '1px solid #ddd',
                  textAlign: 'left',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f1f1f1', // Alternates row colors
                }}
              >
                <td style={{ padding: '8px' }}>{b.title}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{b.author.name}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{b.published}</td>
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
