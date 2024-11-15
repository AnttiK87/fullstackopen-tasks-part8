import { useQuery, useApolloClient } from '@apollo/client'
import { useState, useEffect } from 'react'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notify from './components/Notify'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'

import { ALL_AUTHORS } from './queries'

const App = () => {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)

  const resultAuthors = useQuery(ALL_AUTHORS)

  const client = useApolloClient()

  // Lue token localStoragesta sovelluksen alustuksessa
  useEffect(() => {
    const savedToken = localStorage.getItem('library-user-token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [setToken])

  if (resultAuthors.loading) {
    return <div>loading...</div>
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <>
        <Notify errorMessage={errorMessage} />
        <LoginForm setToken={setToken} setError={notify} />
      </>
    )
  }

  return (
    <div>
      <div>
        <button onClick={logout}>logout</button>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommend')}>recommend</button>
      </div>

      <Notify errorMessage={errorMessage} />
      <Authors show={page === 'authors'} authors={resultAuthors.data.allAuthors} />
      <Books show={page === 'books'} />
      <NewBook show={page === 'add'} setPage={setPage} />
      <Recommend show={page === 'recommend'} />
    </div>
  )
}

export default App
