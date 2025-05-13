import { useState, useEffect } from 'react'
import { Form, Button, Alert, Row, Col } from 'react-bootstrap'
import './UsuarioForm.css'
import cleanIcon from '../assets/clean.png'
import { listarUsuarios, obtenerUsuarioPorId } from '../services/usuarioService'

function UsuarioForm({ initialData = {}, onSubmit, modo = "crear" }) {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rut: '',
    correo: '',
    establecimiento: '',
    ...initialData
  })
  const [usuarios, setUsuarios] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const rut = localStorage.getItem('rut')
        const response = await listarUsuarios(token, rut)
        setUsuarios(response.data)
      } catch (e) {
        // No mostrar error aquí para no molestar al usuario
      }
    }
    cargarUsuarios()
  }, [])

  const handleUsuarioSelect = async (e) => {
    const id = e.target.value
    if (!id) return
    try {
      const token = localStorage.getItem('authToken')
      const response = await obtenerUsuarioPorId(id, token)
      setFormData({ ...response.data })
    } catch (e) {
      setError('Error al cargar el usuario seleccionado')
    }
  }

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
      await onSubmit(formData)
      setSuccess(modo === "crear" ? "Usuario creado exitosamente" : "Usuario modificado exitosamente")
    } catch (error) {
      setError('Error al ' + (modo === "crear" ? "crear" : "modificar") + ' el usuario')
    }
  }

  const handleLimpiar = () => {
    setFormData({
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      rut: '',
      correo: '',
      establecimiento: ''
    })
    setError('')
    setSuccess('')
  }

  return (
    <div className="usuario-form seccion-container">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        {modo === 'editar' && (
          <Form.Group className="mb-3">
            <Form.Label>Seleccionar usuario para editar</Form.Label>
            <Form.Select onChange={handleUsuarioSelect} defaultValue="">
              <option value="">-- Selecciona un usuario --</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nombres} {u.apellido_paterno} {u.apellido_materno} ({u.rut})</option>
              ))}
            </Form.Select>
          </Form.Group>
        )}
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Apellido Paterno</Form.Label>
              <Form.Control
                type="text"
                name="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Apellido Materno</Form.Label>
              <Form.Control
                type="text"
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Establecimiento</Form.Label>
              <Form.Control
                type="text"
                name="establecimiento"
                value={formData.establecimiento}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex gap-2">
          <Button variant="primary" type="submit">
            {modo === "crear" ? "Crear Usuario" : "Guardar Cambios"}
          </Button>
          <Button variant="secondary" type="button" onClick={handleLimpiar} title="Limpiar campos">
            <img src={cleanIcon} alt="Limpiar" style={{ width: 20, marginRight: 6, marginBottom: 3 }} /> Limpiar
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default UsuarioForm