// dependencies
import { useQuery, useApolloClient, useSubscription } from '@apollo/client'
import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notify from './components/Notify'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'
import CustomAlert from './components/CustomAlert'

import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED } from './queries'

// Function to update cache with new items
export const updateCache = (cache, query, addedItem, getItemKey) => {
  const uniqByKey = (array) => {
    let seen = new Set()
    return array.filter((item) => {
      const key = getItemKey(item)
      return seen.has(key) ? false : seen.add(key)
    })
  }

  cache.updateQuery(query, (data) => {
    const key = Object.keys(data)[0]
    return {
      [key]: uniqByKey(data[key].concat(addedItem)),
    }
  })
}

const App = () => {
  // state variables
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [showAlert, setShowAlert] = useState(false)

  const navigate = useNavigate()

  // function for closing alert box
  const handleCloseAlert = () => {
    setShowAlert(false)
    setErrorMessage(null)
  }

  // query to fetch authors
  const resultAuthors = useQuery(ALL_AUTHORS)

  const client = useApolloClient()

  // subscription for books added to websocket server
  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log(data)
      const addedBook = data.data.bookAdded

      // Show notification and update cache
      setErrorMessage(`New book with title: ${addedBook.title} added to the library!`)
      setShowAlert(true)
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook, (item) => item.title)
      updateCache(
        client.cache,
        { query: ALL_AUTHORS },
        { name: addedBook.author.name },
        (item) => item.name
      )
    },
  })

  // set token from local storage to variable
  useEffect(() => {
    const savedToken = localStorage.getItem('library-user-token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [setToken])

  //Showing loading screen if data is being loaded
  if (resultAuthors.loading) {
    return <div>loading...</div>
  }

  // Function for showing notification messages
  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  // Log out the user
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    navigate('/')
  }

  //rendering applications main structure
  if (!token) {
    return (
      <>
        <div
          style={{
            height: '80px',
            maxWidth: '100%',
            backgroundColor: '#007bff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
          }}
        >
          <h1 style={{ color: 'white', marginLeft: '15px' }}>Login</h1>
        </div>
        <Notify errorMessage={errorMessage} />
        <LoginForm setToken={setToken} setError={notify} />
      </>
    )
  }

  // Render main app layout after user login
  return (
    <div>
      {/* Navigation bar */}
      <div
        style={{
          height: '80px',
          maxWidth: '100%',
          backgroundColor: '#007bff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
        }}
      >
        <div style={{ display: 'flex' }}>
          {/* Navigation links */}
          <div style={{ borderRight: 'solid', borderRightColor: 'white' }}>
            <Link to="/">
              <button className={'buttonBlue'} style={{ fontSize: '1.2em', marginRight: '10px' }}>
                Authors
              </button>
            </Link>
          </div>
          <div style={{ borderRight: 'solid', borderRightColor: 'white' }}>
            <Link to="/books">
              <button className={'buttonBlue'} style={{ fontSize: '1.2em', marginRight: '10px' }}>
                Books
              </button>
            </Link>
          </div>
          <div style={{ borderRight: 'solid', borderRightColor: 'white' }}>
            <Link to="/addBook">
              <button className={'buttonBlue'} style={{ fontSize: '1.2em', marginRight: '10px' }}>
                Add book
              </button>
            </Link>
          </div>
          <Link to="/recommend">
            <button className={'buttonBlue'} style={{ fontSize: '1.2em', marginRight: '10px' }}>
              Recommend
            </button>
          </Link>
        </div>
        <button
          className={'buttonBlue'}
          style={{ fontSize: '1.2em', marginLeft: 'auto', marginRight: '30px' }}
          onClick={logout}
        >
          Logout
        </button>
      </div>

      <CustomAlert
        show={showAlert}
        title="Breaking News!"
        message={errorMessage}
        onClose={handleCloseAlert}
      />
      <Notify errorMessage={errorMessage} showAlert={showAlert} />

      {/* Define routes for different views */}
      <Routes>
        <Route path="/" element={<Authors authors={resultAuthors.data.allAuthors} />} />
        <Route path="/books" element={<Books />} />
        <Route path="/addBook" element={<NewBook setError={notify} />} />
        <Route path="/recommend" element={<Recommend />} />
      </Routes>
    </div>
  )
}

export default App
