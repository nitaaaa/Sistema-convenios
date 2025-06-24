import { useState, useEffect } from 'react'
import { Container, Form, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import UsuarioForm from '../../components/UsuarioForm'
import './EditarUsuarioPage.css'
import { editarUsuario, obtenerUsuarioPorId, listarUsuarios } from '../../services/usuarioService'

function EditarUsuarioPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [usuarios, setUsuarios] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [initialData, setInitialData] = useState(null)

  // Cargar lista de usuarios al montar el componente
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const rut = localStorage.getItem('rut')
        const response = await listarUsuarios(token, rut)
        setUsuarios(response.data)
      } catch (e) {
        setError('Error al cargar la lista de usuarios')
      }
    }
    cargarUsuarios()
  }, [])

  // Cargar datos del usuario seleccionado
  const handleUsuarioSelect = async (e) => {
    const id = e.target.value
    setSelectedUserId(id)
    
    if (!id) {
      setInitialData(null)
      return
    }
    
    try {
      const token = localStorage.getItem('authToken')
      const response = await obtenerUsuarioPorId(id, token)
      setInitialData(response.data)
      setError('')
    } catch (e) {
      setError('Error al cargar el usuario seleccionado')
      setInitialData(null)
    }
  }

  const handleSubmit = async (formData) => {
    if (!selectedUserId) {
      setError('Debe seleccionar un usuario para editar')
      return
    }
    
    try {
      const token = localStorage.getItem('authToken')
      await editarUsuario(selectedUserId, formData, token)
      setSuccess('Usuario actualizado exitosamente')
      
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Error al actualizar el usuario'
      )
    }
  }

  return (
    <Container className="editar-usuario-container mt-4">
      <h2 className="mb-4">Editar Usuario</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form.Group className="mb-4">
        <Form.Label>Seleccionar usuario para editar</Form.Label>
        <Form.Select onChange={handleUsuarioSelect} value={selectedUserId}>
          <option value="">-- Selecciona un usuario --</option>
          {usuarios.map((u, index) => (
            <option key={`${u.rut}-${index}`} value={u.rut}>
              {u.nombres} {u.apellido_paterno} {u.apellido_materno} ({u.rut})
            </option>
          ))}
        </Form.Select>
      </Form.Group>

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