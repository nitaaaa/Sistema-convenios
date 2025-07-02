import React, { useState, useEffect } from 'react';
import { Container, Alert, Form, Button, Table } from 'react-bootstrap';
import { obtenerTodosLosEstablecimientosPM, actualizarEstablecimiento } from '../../services/establecimientoService';
import './EditarEstablecimientoPage.css';

function EditarEstablecimientoPage() {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState(null);
  const [nombre, setNombre] = useState('');
  const [establecimientoPadreId, setEstablecimientoPadreId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para obtener el nombre del establecimiento padre
  const obtenerNombreEstablecimientoPadre = (establecimientoId) => {
    if (!establecimientoId) return null;
    const establecimientoPadre = establecimientos.find(est => est.id === establecimientoId);
    return establecimientoPadre ? establecimientoPadre.nombre : null;
  };

  // Función para validar que no se creen ciclos en la jerarquía
  const validarCicloJerarquia = (establecimientoId, nuevoPadreId) => {
    if (!nuevoPadreId) return true; // Sin padre es válido
    
    let actual = nuevoPadreId;
    const visitados = new Set();
    
    while (actual) {
      if (visitados.has(actual)) return false; // Ciclo detectado
      if (actual === establecimientoId) return false; // Se establece como padre de sí mismo
      
      visitados.add(actual);
      const establecimiento = establecimientos.find(est => est.id === actual);
      actual = establecimiento ? establecimiento.establecimiento_id : null;
    }
    
    return true;
  };

  useEffect(() => {
    cargarEstablecimientos();
  }, []);

  const cargarEstablecimientos = async () => {
    try {
      setLoading(true);
      const data = await obtenerTodosLosEstablecimientosPM();
      setEstablecimientos(data);
    } catch (error) {
      setError('Error al cargar los establecimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleEstablecimientoSelect = (establecimiento) => {
    setEstablecimientoSeleccionado(establecimiento);
    setNombre(establecimiento.nombre);
    setEstablecimientoPadreId(establecimiento.establecimiento_id || '');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!establecimientoSeleccionado) {
      setError('Debe seleccionar un establecimiento para editar');
      return;
    }

    if (!nombre.trim()) {
      setError('El nombre del establecimiento es obligatorio');
      return;
    }

    // Validar que no se establezca como padre a sí mismo
    if (establecimientoPadreId && parseInt(establecimientoPadreId) === establecimientoSeleccionado.id) {
      setError('Un establecimiento no puede ser padre de sí mismo');
      return;
    }

    // Validar que no se creen ciclos en la jerarquía
    if (!validarCicloJerarquia(establecimientoSeleccionado.id, establecimientoPadreId)) {
      setError('No se puede establecer esta jerarquía porque crearía un ciclo');
      return;
    }

    try {
      setLoading(true);
      await actualizarEstablecimiento(
        establecimientoSeleccionado.id, 
        nombre, 
        establecimientoPadreId || null
      );
      setSuccess('Establecimiento actualizado exitosamente');
      
      // Actualizar la lista de establecimientos
      await cargarEstablecimientos();
      
      // Limpiar el formulario
      setEstablecimientoSeleccionado(null);
      setNombre('');
      setEstablecimientoPadreId('');
    } catch (error) {
      setError(error.message || 'Error al actualizar el establecimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEstablecimientoSeleccionado(null);
    setNombre('');
    setEstablecimientoPadreId('');
    setError('');
    setSuccess('');
  };

  return (
    <Container className="editar-establecimiento-container mt-4">
      <h2 className="mb-4">Editar Establecimiento</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Seleccionar Establecimiento</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <p>Cargando establecimientos...</p>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Establecimiento Padre</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {establecimientos.map((establecimiento) => (
                        <tr 
                          key={establecimiento.id}
                          className={establecimientoSeleccionado?.id === establecimiento.id ? 'table-primary' : ''}
                        >
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
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEstablecimientoSelect(establecimiento)}
                            >
                              Seleccionar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Editar Establecimiento</h5>
            </div>
            <div className="card-body">
              {establecimientoSeleccionado ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>ID del Establecimiento</Form.Label>
                    <Form.Control
                      type="text"
                      value={establecimientoSeleccionado.id}
                      disabled
                      readOnly
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nombre del Establecimiento</Form.Label>
                    <Form.Control
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ingrese el nuevo nombre"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Establecimiento Padre</Form.Label>
                    <Form.Select
                      value={establecimientoPadreId}
                      onChange={(e) => setEstablecimientoPadreId(e.target.value)}
                    >
                      <option value="">Sin establecimiento padre</option>
                      {establecimientos
                        .filter(est => {
                          // Excluir el establecimiento actual
                          if (est.id === establecimientoSeleccionado?.id) return false;
                          
                          // Excluir establecimientos que crearían ciclos
                          return validarCicloJerarquia(establecimientoSeleccionado?.id, est.id);
                        })
                        .map((est) => (
                          <option key={est.id} value={est.id}>
                            {est.nombre}
                          </option>
                        ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Seleccione el establecimiento padre si este establecimiento depende de otro
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Form>
              ) : (
                <div className="text-center text-muted">
                  <p>Seleccione un establecimiento de la lista para editarlo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default EditarEstablecimientoPage; 