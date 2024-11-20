//Login component

//dependencies
import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'
import { useNavigate } from 'react-router-dom'

const LoginForm = ({ setError, setToken }) => {
  //state variables
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  //set navigate
  const navigate = useNavigate()

  //setting query used for login
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      //handle login error
      setError(error.graphQLErrors[0].message)
    },
  })

  //set token to local storage
  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
    }
  }, [result.data])

  //function of login button
  const submit = async (event) => {
    event.preventDefault()

    login({ variables: { username, password } })
    navigate('/') //after login navgate to "home screen"
  }

  //rendering this component
  return (
    <div>
      <div style={{ maxWidth: '450px', marginLeft: '35px', marginTop: '30px' }}>
        <form onSubmit={submit}>
          <div>
            <strong>username: </strong>
            <input
              style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <strong>password: </strong>
            <input
              style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit" className={'buttonBlue'}>
            login
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
