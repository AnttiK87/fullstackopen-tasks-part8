//Authors component

//dependencies
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { UPDATE_AUTHOR, ALL_AUTHORS } from '../queries'

const Authors = ({ authors }) => {
  //state variables
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  //set name for updating year of birth
  const handleChange = (event) => {
    setName(event.target.value)
  }

  //setting query used for updating year of birth
  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  //function for update button
  const submit = async (event) => {
    event.preventDefault()

    updateAuthor({ variables: { name, born } })

    setName('')
    setBorn('')
  }

  //rendering this component
  return (
    <div style={{ maxWidth: '750px', marginLeft: '35px' }}>
      <h1
        style={{
          marginBottom: '5px',
        }}
      >
        Authors
      </h1>
      <h3
        style={{
          marginBottom: '5px',
        }}
      >
        Set authors birth year
      </h3>
      <form style={{ marginBottom: '10px' }} onSubmit={submit}>
        <label>
          <strong>Select author:</strong>
          <select className={'option'} value={name} onChange={handleChange}>
            <option value="" disabled>
              -- Select an author --
            </option>
            {authors.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <div>
          <strong> Birth year:</strong>
          <input
            className={'option'}
            type="number"
            min="0"
            max={new Date().getFullYear()}
            value={born}
            onChange={({ target }) => setBorn(parseInt(target.value, 10))}
          />
        </div>
        <button className={'buttonBlue'} type="submit">
          Update
        </button>
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
            <th style={{ padding: '12px' }}>Author</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Born</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Books</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((a, index) => (
            <tr
              key={a.name}
              style={{
                borderBottom: '1px solid #ddd',
                textAlign: 'left',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f1f1f1', // Alternates row colors
              }}
            >
              <td style={{ padding: '8px' }}>{a.name}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{a.born}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Authors
