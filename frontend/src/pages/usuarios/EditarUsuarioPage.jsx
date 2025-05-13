import { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import UsuarioForm from '../../components/UsuarioForm'
import './EditarUsuarioPage.css'
import { editarUsuario, obtenerUsuarioPorId } from '../../services/usuarioService'

function EditarUsuarioPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [initialData, setInitialData] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const response = await obtenerUsuarioPorId(id, token)
        setInitialData(response.data)
      } catch (error) {
        setError('Error al cargar los datos del usuario')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [id])

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('authToken')
      await editarUsuario(id, formData, token)
      setSuccess('Usuario actualizado exitosamente')
      setTimeout(() => {
        navigate('/usuarios')
      }, 2000)
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Error al actualizar el usuario'
      )
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <Container className="editar-usuario-container mt-4">
      <h2 className="mb-4">Editar Usuario</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {initialData && (
        <UsuarioForm 
          initialData={initialData}
          onSubmit={handleSubmit}
          modo="editar"
        />
      )}
    </Container>
  )
}

export default EditarUsuarioPage 