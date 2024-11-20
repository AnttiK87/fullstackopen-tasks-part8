//Books component

//dependencies
import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS_BY_GENRE, ALL_BOOKS } from '../queries'

const Books = () => {
  //state variables
  const [genre, setGenre] = useState('')
  //getting books from db
  const { data: allBooksData, loading: allBooksLoading } = useQuery(ALL_BOOKS)
  //getting books from db with filter
  const { data: filteredBooksData, loading: filteredBooksLoading } = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: { genre },
    skip: !genre,
  })
  //setting all books or filtered books to variable
  const books = genre ? filteredBooksData?.allBooks : allBooksData?.allBooks

  //Setting desired genre
  const handleChange = (event) => {
    setGenre(event.target.value)
  }

  //Showing loading screen if data is being loaded
  if (allBooksLoading || (genre && filteredBooksLoading)) {
    return <div>Loading...</div>
  }

  //rendering this component
  return (
    <div style={{ maxWidth: '750px', marginLeft: '35px' }}>
      <h1
        style={{
          marginBottom: '5px',
        }}
      >
        Books
      </h1>
      <h3
        style={{
          marginBottom: '5px',
        }}
      >
        Filter by genre
      </h3>
      <form style={{ marginBottom: '10px' }}>
        <label>
          <strong>Select genre:</strong>
          <select className={'option'} value={genre} onChange={handleChange}>
            <option value="">-- Select genre --</option>
            {[...new Set(allBooksData.allBooks.flatMap((b) => b.genres))].map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>
      </form>

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
          {books.map((b, index) => (
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
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
