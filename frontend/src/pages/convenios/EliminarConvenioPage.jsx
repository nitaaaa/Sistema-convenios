import { useState, useEffect } from 'react'
import { Container, Table, Button, Alert, Modal, Spinner, Form } from 'react-bootstrap'
import { obtenerConveniosPorAnio, eliminarConvenio } from '../../services/convenioService'
import './EliminarConvenioPage.css'

function EliminarConvenioPage() {
  const [convenios, setConvenios] = useState([])
  const [selectedConvenio, setSelectedConvenio] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingConvenios, setLoadingConvenios] = useState(false)
  const [anioSeleccionado, setAnioSeleccionado] = useState('')

  // Generar array de años desde 2024 hasta el año actual
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = 2024; y <= currentYear; y++) {
    years.push(y)
  }

  // Cargar convenios cuando se selecciona un año
  useEffect(() => {
    if (anioSeleccionado) {
      cargarConvenios()
    } else {
      setConvenios([])
    }
  }, [anioSeleccionado])

  const cargarConvenios = async () => {
    try {
      setLoadingConvenios(true)
      setError('')
      const data = await obtenerConveniosPorAnio(anioSeleccionado)
      setConvenios(data)
    } catch (error) {
      setError('Error al cargar los convenios: ' + error.message)
    } finally {
      setLoadingConvenios(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedConvenio) return

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await eliminarConvenio(selectedConvenio.id)
      setSuccess('Convenio eliminado exitosamente')
      setShowModal(false)
      setSelectedConvenio(null)
      
      // Recargar la lista de convenios
      await cargarConvenios()
    } catch (error) {
      setError('Error al eliminar el convenio: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="eliminar-convenio-container mt-4">
      <h2 className="mb-4">Eliminar Convenio</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Selector de año */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Seleccionar Año</h5>
        </div>
        <div className="card-body">
          <Form.Group>
            <Form.Label>Año del Convenio</Form.Label>
            <Form.Select
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(e.target.value)}
              disabled={loadingConvenios}
            >
              <option value="">Seleccione un año</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Seleccione el año para ver los convenios disponibles
            </Form.Text>
          </Form.Group>
        </div>
      </div>

      {!anioSeleccionado ? (
        <Alert variant="info">
          Seleccione un año para ver los convenios disponibles.
        </Alert>
      ) : loadingConvenios ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
                  <p className="mt-2">Cargando convenios del año {anioSeleccionado}...</p>
      </div>
    ) : convenios.length === 0 ? (
      <Alert variant="info">
        No hay convenios disponibles para el año {anioSeleccionado}.
      </Alert>
    ) : (
        <div className="card">
          <div className="card-header">
            <h5>Convenios Disponibles - Año {anioSeleccionado}</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Monto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {convenios.map(convenio => (
                    <tr key={convenio.id}>
                      <td>{convenio.id}</td>
                      <td>{convenio.nombre}</td>
                      <td>{convenio.descripcion || 'Sin descripción'}</td>
                      <td>{convenio.inicio ? new Date(convenio.inicio).toLocaleDateString() : 'N/A'}</td>
                      <td>{convenio.termino ? new Date(convenio.termino).toLocaleDateString() : 'N/A'}</td>
                      <td>${convenio.monto ? convenio.monto.toLocaleString() : '0'}</td>
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
            </div>
          </div>
        </div>
      )}

      <Modal show={showModal} onHide={() => !loading && setShowModal(false)}>
        <Modal.Header closeButton={!loading}>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>¡Advertencia!</strong> Esta acción eliminará permanentemente el convenio y todos sus datos relacionados:
          </Alert>
          <ul>
            <li><strong>Convenio:</strong> {selectedConvenio?.nombre}</li>
            <li><strong>Descripción:</strong> {selectedConvenio?.descripcion || 'Sin descripción'}</li>
            <li><strong>Período:</strong> {selectedConvenio?.inicio ? new Date(selectedConvenio.inicio).toLocaleDateString() : 'N/A'} - {selectedConvenio?.termino ? new Date(selectedConvenio.termino).toLocaleDateString() : 'N/A'}</li>
            <li><strong>Monto:</strong> ${selectedConvenio?.monto ? selectedConvenio.monto.toLocaleString() : '0'}</li>
          </ul>
          <p className="text-danger">
            <strong>Esta acción no se puede deshacer y eliminará:</strong>
          </p>
          <ul className="text-danger">
            <li>Todos los componentes del convenio</li>
            <li>Todos los indicadores asociados</li>
            <li>Todas las fórmulas de cálculo</li>
            <li>Todas las cuotas y descuentos</li>
            <li>El convenio en sí</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Eliminando...
              </>
            ) : (
              'Eliminar Convenio'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default EliminarConvenioPage 