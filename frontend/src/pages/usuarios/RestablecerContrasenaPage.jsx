import { useState } from 'react'
import { Container, Alert, Form, Button } from 'react-bootstrap'
import UsuarioFiltros from '../../components/UsuarioFiltros'
import ContrasenaForm from '../../components/ContrasenaForm'
import { restablecerContrasena } from '../../services/usuarioService'
import './RestablecerContrasenaPage.css'

function RestablecerContrasenaPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleUsuarioSelect = (usuario) => {
    setSelectedUsuario(usuario)
    setError('')
    setSuccess('')
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedUsuario) {
      setError('Debe seleccionar un usuario')
      return
    }

    if (!nuevaContrasena || nuevaContrasena.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('authToken')
      await restablecerContrasena(selectedUsuario.rut, nuevaContrasena, token)
      
      setSuccess('Contraseña restablecida exitosamente')
      setNuevaContrasena('')
      setConfirmarContrasena('')
      setSelectedUsuario(null)
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Error al restablecer la contraseña'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container className="restablecer-contrasena-container mt-4">
      <h2 className="mb-4">Restablecer Contraseña de Usuario</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <UsuarioFiltros 
        onUsuarioSelect={handleUsuarioSelect}
        onError={handleError}
      />

      {selectedUsuario && (
        <div className="seccion-container" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <h4 className="mb-3">Usuario Seleccionado</h4>
          <p><strong>Nombre:</strong> {selectedUsuario.nombres} {selectedUsuario.apellido_paterno} {selectedUsuario.apellido_materno}</p>
          <p><strong>RUT:</strong> {selectedUsuario.rut}</p>
          <p><strong>Correo:</strong> {selectedUsuario.correo}</p>
          
          <Form onSubmit={handleSubmit} className="mt-4">
            <ContrasenaForm
              contrasena={nuevaContrasena}
              setContrasena={setNuevaContrasena}
              confirmarContrasena={confirmarContrasena}
              setConfirmarContrasena={setConfirmarContrasena}
              mostrarValidacion={true}
              minLength={8}
              requerirConfirmacion={true}
            />

            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading}
              className="me-2"
            >
              {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </Button>
            
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => {
                setSelectedUsuario(null)
                setNuevaContrasena('')
                setConfirmarContrasena('')
                setError('')
                setSuccess('')
              }}
            >
              Cancelar
            </Button>
          </Form>
        </div>
      )}
    </Container>
  )
}

export default RestablecerContrasenaPage 