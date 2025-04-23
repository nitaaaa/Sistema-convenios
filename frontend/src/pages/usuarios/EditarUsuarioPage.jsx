import { useState, useEffect } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'

function EditarUsuarioPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'usuario'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Aquí irá la lógica para cargar los datos del usuario
    const loadUser = async () => {
      try {
        // Simulación de carga de datos
        setFormData({
          nombre: 'Usuario de Prueba',
          email: 'usuario@ejemplo.com',
          rol: 'usuario'
        })
      } catch (error) {
        setError('Error al cargar los datos del usuario')
      }
    }

    loadUser()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Aquí irá la lógica para actualizar el usuario
      console.log('Actualizando usuario:', formData)
      setSuccess('Usuario actualizado exitosamente')
      setTimeout(() => {
        navigate('/usuarios')
      }, 2000)
    } catch (error) {
      setError('Error al actualizar el usuario')
    }
  }

  return (
    <Container className="mt-4">
      <h2>Editar Usuario</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Rol</Form.Label>
          <Form.Select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            required
          >
            <option value="usuario">Usuario</option>
            <option value="admin">Administrador</option>
          </Form.Select>
        </Form.Group>

        <div className="d-flex gap-2">
          <Button variant="primary" type="submit">
            Guardar Cambios
          </Button>
          <Button variant="secondary" onClick={() => navigate('/usuarios')}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  )
}

export default EditarUsuarioPage 