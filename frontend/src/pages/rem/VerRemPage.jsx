import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Table, Pagination, Modal } from 'react-bootstrap';
import { obtenerArchivosRem, eliminarArchivoRem } from '../../services/remService';
import { obtenerTodosLosEstablecimientosPM } from '../../services/establecimientoService';
import { meses, ordenarMeses } from '../../utils/dateUtils';
import './VerRemPage.css';

function VerRemPage() {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [archivosRem, setArchivosRem] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para los filtros
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState('');
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [anoSeleccionado, setAnoSeleccionado] = useState('');

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [archivosPorPagina] = useState(20);

  // Estados para ordenamiento
  const [archivosOrdenados, setArchivosOrdenados] = useState([]);

  // Estados para el modal de eliminación
  const [showModal, setShowModal] = useState(false);
  const [archivoAEliminar, setArchivoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Generar años (desde 2020 hasta el año actual + 1)
  const anoActual = new Date().getFullYear();
  const anos = [];
  for (let ano = 2020; ano <= anoActual + 1; ano++) {
    anos.push(ano);
  }

  // Cargar establecimientos al montar el componente
  useEffect(() => {
    const cargarEstablecimientos = async () => {
      try {
        const data = await obtenerTodosLosEstablecimientosPM();
        setEstablecimientos(data);
      } catch (error) {
        setError('Error al cargar los establecimientos: ' + error.message);
      }
    };
    cargarEstablecimientos();
  }, []);

  // Función para buscar archivos REM
  const buscarArchivos = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setPaginaActual(1); // Resetear a la primera página

    try {
      const data = await obtenerArchivosRem(
        establecimientoSeleccionado,
        mesSeleccionado,
        anoSeleccionado
      );
      
      // Ordenar archivos por mes
      const archivosOrdenados = ordenarArchivosPorMes(data);
      setArchivosOrdenados(archivosOrdenados);
      setArchivosRem(data); // Mantener los datos originales también
      
      if (data.length === 0) {
        setSuccess('No se encontraron archivos REM para los criterios seleccionados');
      } else {
        // Construir mensaje descriptivo
        const filtrosAplicados = [];
        if (establecimientoSeleccionado) {
          const establecimiento = establecimientos.find(e => e.id == establecimientoSeleccionado);
          filtrosAplicados.push(`Establecimiento: ${establecimiento?.nombre || 'N/A'}`);
        }
        if (mesSeleccionado) {
          const mes = meses.find(m => m.valor === mesSeleccionado);
          filtrosAplicados.push(`Mes: ${mes?.nombre || mesSeleccionado}`);
        }
        if (anoSeleccionado) {
          filtrosAplicados.push(`Año: ${anoSeleccionado}`);
        }
        
        const mensajeFiltros = filtrosAplicados.length > 0 
          ? ` (Filtros: ${filtrosAplicados.join(', ')})`
          : ' (Sin filtros aplicados)';
        
        const mensajePaginacion = data.length > archivosPorPagina 
          ? ` - Mostrando ${archivosPorPagina} por página`
          : '';
        
        setSuccess(`Se encontraron ${data.length} archivo(s) REM${mensajeFiltros}${mensajePaginacion} - Ordenados por mes`);
      }
    } catch (error) {
      setError('Error al buscar archivos: ' + error.message);
      setArchivosRem([]);
      setArchivosOrdenados([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setEstablecimientoSeleccionado('');
    setMesSeleccionado('');
    setAnoSeleccionado('');
    setArchivosRem([]);
    setArchivosOrdenados([]);
    setPaginaActual(1);
    setError('');
    setSuccess('');
  };

  // Función para ordenar archivos por mes
  const ordenarArchivosPorMes = (archivos) => {
    if (!archivos || archivos.length === 0) return [];
    
    // Crear array de pares [mes, archivo] para usar con ordenarMeses
    const archivosConMes = archivos.map(archivo => {
      const nombreMes = meses.find(m => m.valor === archivo.mes.toString())?.nombre || archivo.mes;
      return [nombreMes, archivo];
    });
    
    // Ordenar usando la utilidad existente
    const archivosOrdenados = ordenarMeses(archivosConMes);
    
    // Extraer solo los archivos del resultado ordenado
    return archivosOrdenados.map(([mes, archivo]) => archivo);
  };

  // Calcular archivos para la página actual (con ordenamiento)
  const indiceInicio = (paginaActual - 1) * archivosPorPagina;
  const indiceFin = indiceInicio + archivosPorPagina;
  const archivosPaginaActual = archivosOrdenados.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(archivosOrdenados.length / archivosPorPagina);

  // Función para cambiar de página
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  // Función para mostrar modal de eliminación
  const handleShowModal = (archivo) => {
    setArchivoAEliminar(archivo);
    setShowModal(true);
  };

  // Función para cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setArchivoAEliminar(null);
    setEliminando(false);
  };

  // Función para eliminar archivo
  const handleEliminar = async () => {
    if (!archivoAEliminar) return;

    setEliminando(true);
    try {
      await eliminarArchivoRem(archivoAEliminar.id);
      setSuccess(`Archivo "${archivoAEliminar.nombreArchivo}" eliminado exitosamente`);
      handleCloseModal();
      
      // Recargar la lista de archivos
      await buscarArchivos();
    } catch (error) {
      setError('Error al eliminar el archivo: ' + error.message);
      handleCloseModal();
    } finally {
      setEliminando(false);
    }
  };

  // Generar elementos de paginación
  const generarElementosPaginacion = () => {
    const elementos = [];
    
    // Botón "Anterior"
    elementos.push(
      <Pagination.Prev
        key="prev"
        onClick={() => cambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
      />
    );

    // Páginas
    const inicio = Math.max(1, paginaActual - 2);
    const fin = Math.min(totalPaginas, paginaActual + 2);

    // Primera página si no está en el rango
    if (inicio > 1) {
      elementos.push(
        <Pagination.Item
          key={1}
          onClick={() => cambiarPagina(1)}
        >
          1
        </Pagination.Item>
      );
      if (inicio > 2) {
        elementos.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }

    // Páginas del rango
    for (let i = inicio; i <= fin; i++) {
      elementos.push(
        <Pagination.Item
          key={i}
          active={i === paginaActual}
          onClick={() => cambiarPagina(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Última página si no está en el rango
    if (fin < totalPaginas) {
      if (fin < totalPaginas - 1) {
        elementos.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      elementos.push(
        <Pagination.Item
          key={totalPaginas}
          onClick={() => cambiarPagina(totalPaginas)}
        >
          {totalPaginas}
        </Pagination.Item>
      );
    }

    // Botón "Siguiente"
    elementos.push(
      <Pagination.Next
        key="next"
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
      />
    );

    return elementos;
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Ver Archivos REM</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Filtros de búsqueda</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-3">
            <small>Los filtros son opcionales. Si no seleccionas un campo, se buscarán todos los registros para ese criterio.</small>
          </p>
          <div className="row">
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Establecimiento <small className="text-muted">(opcional)</small></Form.Label>
                <Form.Select
                  value={establecimientoSeleccionado}
                  onChange={(e) => setEstablecimientoSeleccionado(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Todos los establecimientos</option>
                  {establecimientos.map((establecimiento) => (
                    <option key={establecimiento.id} value={establecimiento.id}>
                      {establecimiento.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Mes <small className="text-muted">(opcional)</small></Form.Label>
                <Form.Select
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Todos los meses</option>
                  {meses.map((mes) => (
                    <option key={mes.valor} value={mes.valor}>
                      {mes.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Año <small className="text-muted">(opcional)</small></Form.Label>
                <Form.Select
                  value={anoSeleccionado}
                  onChange={(e) => setAnoSeleccionado(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Todos los años</option>
                  {anos.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={buscarArchivos}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Buscando...
                </>
              ) : (
                'Buscar Archivos'
              )}
            </Button>
            <Button
              variant="info"
              onClick={() => {
                setEstablecimientoSeleccionado('');
                setMesSeleccionado('');
                setAnoSeleccionado('');
                buscarArchivos();
              }}
              disabled={loading}
            >
              Ver Todos los Archivos
            </Button>
            <Button
              variant="secondary"
              onClick={limpiarFiltros}
              disabled={loading}
            >
              Limpiar Filtros
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Tabla de resultados */}
      {archivosRem.length > 0 && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">Archivos REM encontrados</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre del Archivo</th>
                  <th>Establecimiento</th>
                  <th>Mes <small className="text-muted">(ordenado)</small></th>
                  <th>Año</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {archivosPaginaActual.map((archivo, index) => (
                  <tr key={archivo.id}>
                    <td>{indiceInicio + index + 1}</td>
                    <td>{archivo.nombreArchivo || 'N/A'}</td>
                    <td>{archivo.nombreEstablecimiento || 'N/A'}</td>
                    <td>{meses.find(m => m.valor === archivo.mes.toString())?.nombre || archivo.mes}</td>
                    <td>{archivo.ano}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('authToken');
                              const response = await fetch(`${import.meta.env.VITE_API_URL}/rem/descargar/${archivo.id}`, {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              });
                              
                              if (!response.ok) {
                                throw new Error('Error al descargar el archivo');
                              }
                              
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = archivo.nombreArchivo || 'archivo-rem.xlsx';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              console.error('Error al descargar:', error);
                              alert('Error al descargar el archivo');
                            }
                          }}
                        >
                          Descargar
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleShowModal(archivo)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Paginacion */}
      {totalPaginas > 1 && (
        <Pagination className="justify-content-center mt-3">
          {generarElementosPaginacion()}
        </Pagination>
      )}

      {/* Modal de confirmación de eliminación */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton={!eliminando}>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {archivoAEliminar && (
            <div>
              <Alert variant="warning">
                <strong>¡Advertencia!</strong> Esta acción eliminará permanentemente el archivo REM:
              </Alert>
              <ul className="mb-0">
                <li><strong>Nombre:</strong> {archivoAEliminar.nombreArchivo}</li>
                <li><strong>Establecimiento:</strong> {archivoAEliminar.nombreEstablecimiento}</li>
                <li><strong>Mes:</strong> {meses.find(m => m.valor === archivoAEliminar.mes.toString())?.nombre || archivoAEliminar.mes}</li>
                <li><strong>Año:</strong> {archivoAEliminar.ano}</li>
              </ul>
              <Alert variant="danger" className="mt-3">
                <strong>Esta acción no se puede deshacer.</strong> Se eliminará:
                <ul className="mb-0 mt-2">
                  <li>El archivo físico del servidor</li>
                  <li>El registro de la base de datos</li>
                  <li>Todos los resultados de cálculo asociados</li>
                </ul>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleCloseModal}
            disabled={eliminando}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleEliminar}
            disabled={eliminando}
          >
            {eliminando ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Eliminando...
              </>
            ) : (
              'Eliminar Archivo'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default VerRemPage; 