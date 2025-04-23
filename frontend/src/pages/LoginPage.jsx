import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if (token) {
      console.log('🎟️ Token recibido')
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

  return (
    <div className="container mt-5">
      <h2>Iniciar sesión con Outlook</h2>
      <a href="https://localhost:3000/auth/microsoft">
        <button className="btn btn-primary mt-3">Iniciar sesión</button>
      </a>
    </div>
  )
}

export default LoginPage

