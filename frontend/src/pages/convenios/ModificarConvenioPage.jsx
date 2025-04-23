import { useState, useEffect } from 'react'
import { Container, Form, Button, Alert, Table } from 'react-bootstrap'
import { useParams } from 'react-router-dom'

function ModificarConvenioPage() {
  const { id } = useParams()
  const [convenios, setConvenios] = useState([])
  const [selectedConvenio, setSelectedConvenio] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'activo'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Aquí irá la lógica para cargar los convenios
    const conveniosEjemplo = [
      { id: 1, nombre: 'Convenio 1', descripcion: 'Descripción 1', fechaInicio: '2024-01-01', fechaFin: '2024-12-31', estado: 'activo' },
      { id: 2, nombre: 'Convenio 2', descripcion: 'Descripción 2', fechaInicio: '2024-02-01', fechaFin: '2024-11-30', estado: 'inactivo' }
    ]
    setConvenios(conveniosEjemplo)
  }, [])

  const handleSelectConvenio = (convenio) => {
    setSelectedConvenio(convenio)
    setFormData({
      nombre: convenio.nombre,
      descripcion: convenio.descripcion,
      fechaInicio: convenio.fechaInicio,
      fechaFin: convenio.fechaFin,
      estado: convenio.estado
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Aquí irá la lógica para modificar el convenio
      console.log('Datos del convenio a modificar:', formData)
      setSuccess('Convenio modificado exitosamente')
    } catch (error) {
      setError('Error al modificar el convenio')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Container className="mt-4">
      <h2>Modificar Convenio</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="mb-4">
        <h4>Seleccionar Convenio</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {convenios.map(convenio => (
              <tr key={convenio.id}>
                <td>{convenio.id}</td>
                <td>{convenio.nombre}</td>
                <td>{convenio.estado}</td>
                <td>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleSelectConvenio(convenio)}
                  >
                    Seleccionar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {selectedConvenio && (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Convenio</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de Inicio</Form.Label>
            <Form.Control
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de Fin</Form.Label>
            <Form.Control
              type="date"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </Form.Select>
          </Form.Group>

          <Button variant="primary" type="submit">
            Guardar Cambios
          </Button>
        </Form>
      )}
    </Container>
  )
}

export default ModificarConvenioPage 