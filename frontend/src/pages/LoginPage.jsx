import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import logoMicrosoft from '../assets/Logo-Microsoft.png'
import './LoginPage.css'
import { EXPIRATION_TIME } from '../../constans';
import { buscarUsuarioPorCorreo, buscarEstablecimientosPorUsuario } from '../services/usuarioService'
import { formatRut } from '../utils/rutUtils'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL;

function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if (token) {
      const decoded = jwtDecode(token)
      const email = decoded.email
      // Validar si el usuario existe en la BD
      const validarUsuario = async () => {
        try {
          // Usamos el token recibido para autenticarnos en la consulta
          const usuario = await buscarUsuarioPorCorreo(email, token)
          const userData = {
            nombre: usuario.data.nombres,
            apellidoPaterno: usuario.data.apellidoPaterno,
            apellidoMaterno: usuario.data.apellidoMaterno,
            rut: usuario.data.rut,
            correo: usuario.data.correo,
          };
          
          // Guardar en localStorage y actualizar el contexto
          localStorage.setItem('authToken', token);
          localStorage.setItem('expiresAt', EXPIRATION_TIME);
          login(token, userData);
          
          navigate('/reportes')
        } catch (err) {
          setError('El usuario no pertenece a la organización')
        }
      }
      validarUsuario()
    }
  }, [location, navigate, login])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { 
        rut: rut, 
        contrasena: password 
      })
      
      // Guardar en localStorage y actualizar el contexto
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('expiresAt', EXPIRATION_TIME);
      login(res.data.token, res.data.user);
      
      navigate('/reportes')
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError('Usuario o contraseña incorrectos')
      }
    }
  }

  return (
    <div className="container-fluid">
      <h2>Módulo gestión de convenios</h2>
      <div className="container border rounded login-container">
        <h2 className="login-title">Iniciar sesión</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="mb-3">
            <label className="form-label">Rut</label>
            <input
              type="text"
              className="form-control"
              value={rut}
              onChange={e => setRut(formatRut(e.target.value))}
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

