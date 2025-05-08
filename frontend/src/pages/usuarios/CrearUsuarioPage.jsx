import { useState } from 'react'
import { Container } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import UsuarioForm from '../../components/UsuarioForm'
import axios from 'axios'
import './CrearUsuarioPage.css'

function CrearUsuarioPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('authToken')
      await axios.post('/api/usuarios',formData,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setSuccess('Usuario creado exitosamente')
      /*setTimeout(() => {
        navigate('/usuarios')
      }, 2000)*/
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Error al crear el usuario'
      )
    }
  }

  return (
    <Container className="crear-usuario-container mt-4">
      <h2>Crear Usuario</h2>
      <UsuarioForm 
        onSubmit={handleSubmit}
        modo="crear"
      />
    </Container>
  )
}

export default CrearUsuarioPage 