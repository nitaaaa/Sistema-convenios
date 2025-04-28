import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import logoMicrosoft from '../assets/Logo-Microsoft.png'
import './LoginPage.css'

function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if (token) {
      const decoded = jwtDecode(token)
      // Guardamos el token y los datos del usuario
      localStorage.setItem('authToken', token)
      localStorage.setItem('userData', JSON.stringify({
        email: decoded.email,
        nombre: decoded.nombre
      }))

      // Redirigimos a la página de reportes
      navigate('/reportes')
    }
  }, [location, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      // Cambia la URL por la de tu backend
      const res = await axios.post('/api/auth/login', { email, password })
      localStorage.setItem('authToken', res.data.token)
      localStorage.setItem('userData', JSON.stringify(res.data.user))
      navigate('/reportes')
    } catch (err) {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="container-fluid">
      <h2>Módulo gestion de convenios</h2>
      <div className="container border rounded login-container">
        <h2 className="login-title">Iniciar sesión</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="mb-3">
            <label className="form-label">Rut</label>
            <input
              type="text"
              className="form-control"
              value={rut}
              onChange={e => setRut(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger error-message">{error}</div>}
          <button type="submit" className="btn btn-primary login-button">Ingresar</button>
        </form>
        <hr className="login-divider"/>
        <div className="login-alternative">
          <p>O ingresa con tu correo institucional:</p>
          <a href="https://localhost:3000/auth/microsoft">
            <button className="btn btn-outline-primary login-microsoft-button">
              <img src={logoMicrosoft} alt="Microsoft" />
              Iniciar sesión con Outlook
            </button>
          </a>
        </div>
      </div>
    </div>
    
  )
}

export default LoginPage

