//custom alert component

//dependencies
import './CustomAlert.css'

const CustomAlert = ({ show, title, message, onClose }) => {
  //determine if alert is shown or not
  if (!show) {
    return null
  }

  //rendering this component
  return (
    <div className="overlay">
      <div className="alert-box">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  )
}

export default CustomAlert
