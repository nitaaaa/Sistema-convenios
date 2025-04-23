import { useState, useEffect } from 'react'
import { Container, Table, Button, Alert, Modal } from 'react-bootstrap'

function EliminarConvenioPage() {
  const [convenios, setConvenios] = useState([])
  const [selectedConvenio, setSelectedConvenio] = useState(null)
  const [showModal, setShowModal] = useState(false)
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

  const handleDelete = async () => {
    setError('')
    setSuccess('')

    try {
      // Aquí irá la lógica para eliminar el convenio
      console.log('Eliminando convenio:', selectedConvenio)
      setSuccess('Convenio eliminado exitosamente')
      setShowModal(false)
      setSelectedConvenio(null)
    } catch (error) {
      setError('Error al eliminar el convenio')
    }
  }

  return (
    <Container className="mt-4">
      <h2>Eliminar Convenio</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

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
                  variant="danger" 
                  size="sm"
                  onClick={() => {
                    setSelectedConvenio(convenio)
                    setShowModal(true)
                  }}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar el convenio "{selectedConvenio?.nombre}"?
          Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default EliminarConvenioPage 