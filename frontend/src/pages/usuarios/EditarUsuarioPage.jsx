import { useState } from 'react'
import { Container, Alert } from 'react-bootstrap'
import UsuarioForm from '../../components/UsuarioForm'
import UsuarioFiltros from '../../components/UsuarioFiltros'
import './EditarUsuarioPage.css'
import { editarUsuario } from '../../services/usuarioService'

function EditarUsuarioPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [initialData, setInitialData] = useState(null)

  const handleSubmit = async (formData) => {
    if (!initialData) {
      setError('Debe seleccionar un usuario para editar')
      return
    }
    
    try {
      const token = localStorage.getItem('authToken')
      await editarUsuario(initialData.rut, formData, token)
      setSuccess('Usuario actualizado exitosamente')
      
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Error al actualizar el usuario'
      )
    }
  }

  const handleUsuarioSelect = (usuario) => {
    setInitialData(usuario)
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
  }

  return (
    <Container className="editar-usuario-container mt-4" >
      <h2 className="mb-4">Editar Usuario</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <UsuarioFiltros 
        onUsuarioSelect={handleUsuarioSelect}
        onError={handleError}
      />
      
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