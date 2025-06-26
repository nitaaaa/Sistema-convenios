import { useState } from 'react'
import { Container } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import UsuarioForm from '../../components/UsuarioForm'
import axios from 'axios'
import './CrearUsuarioPage.css'
import { crearUsuario } from '../../services/usuarioService'

function CrearUsuarioPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('authToken')
      await crearUsuario(formData, token)
      setSuccess('Usuario creado exitosamente')
      setError('')
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Error al crear el usuario'
      )
      setSuccess('')
    }
  }

  return (
    <Container className="crear-usuario-container mt-4" >
      <h2>Crear Usuario</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <UsuarioForm 
        onSubmit={handleSubmit}
        modo="crear"
      />
    </Container>
  )
}

export default CrearUsuarioPage 