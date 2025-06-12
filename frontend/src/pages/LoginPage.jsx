import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import logoMicrosoft from '../assets/Logo-Microsoft.png'
import './LoginPage.css'
import { EXPIRATION_TIME } from '../../constans';
import { buscarUsuarioPorCorreo, buscarEstablecimientosPorUsuario } from '../services/usuarioService'

function guardarSesion(token, userData) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('expiresAt', EXPIRATION_TIME);
  localStorage.setItem('userData', JSON.stringify(userData));
}

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
      const email = decoded.email
      // Validar si el usuario existe en la BD
      const validarUsuario = async () => {
        try {
          // Usamos el token recibido para autenticarnos en la consulta
          const usuario = await buscarUsuarioPorCorreo(email, token)
          const establecimientos = await buscarEstablecimientosPorUsuario(usuario.data.rut, token)
          const idEstablecimientos = establecimientos.data.map(est => est.id);
          guardarSesion(token, {
            nombre: usuario.data.nombres,
            apellidoPaterno: usuario.data.apellidoPaterno,
            apellidoMaterno: usuario.data.apellidoMaterno,
            rut: usuario.data.rut,
            correo: usuario.data.correo,
            establecimientos: idEstablecimientos,
          });
          navigate('/reportes')
        } catch (err) {
          setError('El usuario no pertenece a la organización')
        }
      }
      validarUsuario()
      
      

    }
  }, [location, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      guardarSesion(res.data.token, res.data.user)
      navigate('/reportes')
    } catch (err) {
      setError('Usuario o contraseña incorrectos')
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

