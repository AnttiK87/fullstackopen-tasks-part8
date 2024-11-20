// component for showing error messages to user
const Notify = ({ showAlert, errorMessage }) => {
  if (!errorMessage || showAlert) {
    return null
  }
  return <h2 style={{ padding: '5px', marginLeft: '35px', color: 'red' }}>{errorMessage}</h2>
}

export default Notify
