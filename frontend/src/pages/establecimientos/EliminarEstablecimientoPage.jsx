import React, { useState, useEffect } from 'react';
import { Container, Alert, Form, Button, Table, Modal, Spinner } from 'react-bootstrap';
import { obtenerTodosLosEstablecimientosPM, eliminarEstablecimiento } from '../../services/establecimientoService';
import './EliminarEstablecimientoPage.css';

function EliminarEstablecimientoPage() {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEstablecimientos, setLoadingEstablecimientos] = useState(false);

  // Cargar establecimientos al montar el componente
  useEffect(() => {
    cargarEstablecimientos();
  }, []);

  const cargarEstablecimientos = async () => {
    try {
      setLoadingEstablecimientos(true);
      setError('');
      const data = await obtenerTodosLosEstablecimientosPM();
      setEstablecimientos(data);
    } catch (error) {
      setError('Error al cargar los establecimientos: ' + error.message);
    } finally {
      setLoadingEstablecimientos(false);
    }
  };

  const handleDelete = async () => {
    if (!establecimientoSeleccionado) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await eliminarEstablecimiento(establecimientoSeleccionado.id);
      setSuccess('Establecimiento eliminado exitosamente');
      setShowModal(false);
      setEstablecimientoSeleccionado(null);
      
      // Recargar la lista de establecimientos
      await cargarEstablecimientos();
    } catch (error) {
      setError('Error al eliminar el establecimiento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el nombre del establecimiento padre
  const obtenerNombreEstablecimientoPadre = (establecimientoId) => {
    if (!establecimientoId) return null;
    const establecimientoPadre = establecimientos.find(est => est.id === establecimientoId);
    return establecimientoPadre ? establecimientoPadre.nombre : null;
  };

  return (
    <Container className="eliminar-establecimiento-container mt-4">
      <h2 className="mb-4">Eliminar Establecimiento</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loadingEstablecimientos ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando establecimientos...</p>
        </div>
      ) : establecimientos.length === 0 ? (
        <Alert variant="info">
          No hay establecimientos disponibles para eliminar.
        </Alert>
      ) : (
        <div className="card">
          <div className="card-header">
            <h5>Establecimientos Disponibles</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Establecimiento Padre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {establecimientos.map((establecimiento) => (
                    <tr key={establecimiento.id}>
                      <td>{establecimiento.id}</td>
                      <td>{establecimiento.nombre}</td>
                      <td>
                        {establecimiento.establecimiento_id ? (
                          obtenerNombreEstablecimientoPadre(establecimiento.establecimiento_id) || 
                          `ID: ${establecimiento.establecimiento_id}`
                        ) : (
                          <span className="text-muted">Sin padre</span>
                        )}
                      </td>
                      <td>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => {
                            setEstablecimientoSeleccionado(establecimiento);
                            setShowModal(true);
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
            <strong>¡Advertencia!</strong> Esta acción eliminará permanentemente el establecimiento:
          </Alert>
          <ul>
            <li><strong>ID:</strong> {establecimientoSeleccionado?.id}</li>
            <li><strong>Nombre:</strong> {establecimientoSeleccionado?.nombre}</li>
            <li><strong>Establecimiento Padre:</strong> {
              establecimientoSeleccionado?.establecimiento_id ? 
              obtenerNombreEstablecimientoPadre(establecimientoSeleccionado.establecimiento_id) || 
              `ID: ${establecimientoSeleccionado.establecimiento_id}` : 
              'Sin padre'
            }</li>
          </ul>
          <p className="text-danger">
            <strong>Esta acción no se puede deshacer.</strong>
          </p>
          <Alert variant="info">
            <strong>Nota:</strong> Solo se pueden eliminar establecimientos que:
            <ul className="mb-0 mt-2">
              <li>No tengan establecimientos dependientes</li>
              <li>No tengan usuarios asociados</li>
              <li>No tengan archivos REM asociados</li>
            </ul>
          </Alert>
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
              'Eliminar Establecimiento'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default EliminarEstablecimientoPage; 