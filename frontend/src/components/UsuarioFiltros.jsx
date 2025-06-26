import { useState, useEffect } from 'react'
import { Form, Row, Col, Button } from 'react-bootstrap'
import { listarUsuarios, obtenerUsuarioPorId } from '../services/usuarioService'
import { formatRut } from '../utils/rutUtils'

function UsuarioFiltros({ onUsuarioSelect, onError }) {
  const [usuarios, setUsuarios] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [rutBusqueda, setRutBusqueda] = useState('')

  // Cargar lista de usuarios al montar el componente
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const rut = localStorage.getItem('rut')
        const response = await listarUsuarios(token, rut)
        setUsuarios(response.data)
      } catch (e) {
        onError('Error al cargar la lista de usuarios')
      }
    }
    cargarUsuarios()
  }, [onError])

  // Cargar datos del usuario seleccionado
  const handleUsuarioSelect = async (e) => {
    const id = e.target.value
    setSelectedUserId(id)
    
    if (!id) {
      onUsuarioSelect(null)
      return
    }
    
    try {
      const token = localStorage.getItem('authToken')
      const response = await obtenerUsuarioPorId(id, token)
      onUsuarioSelect(response.data)
      onError('')
    } catch (e) {
      onError('Error al cargar el usuario seleccionado')
      onUsuarioSelect(null)
    }
  }

  // Manejar cambio en el input de RUT
  const handleRutChange = (e) => {
    const formattedRut = formatRut(e.target.value)
    setRutBusqueda(formattedRut)
  }

  // Buscar usuario por RUT
  const handleBuscarPorRut = async () => {
    if (!rutBusqueda) {
      onError('Debe ingresar un RUT para buscar')
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await obtenerUsuarioPorId(rutBusqueda, token)
      onUsuarioSelect(response.data)
      setSelectedUserId(rutBusqueda)
      onError('')
    } catch (e) {
      onError('Usuario no encontrado con el RUT ingresado')
      onUsuarioSelect(null)
      setSelectedUserId('')
    }
  }

  return (
    <div className="seccion-container" style={{ padding: '1rem', marginBottom: '1rem' }}>
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
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
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Buscar por RUT</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="Ingrese RUT (ej: 12.345.678-9)"
                value={rutBusqueda}
                onChange={handleRutChange}
                className="me-2"
              />
              <Button 
                variant="primary" 
                onClick={handleBuscarPorRut}
                style={{ minWidth: '100px' }}
              >
                Buscar
              </Button>
            </div>
          </Form.Group>
        </Col>
      </Row>
    </div>
  )
}

export default UsuarioFiltros 