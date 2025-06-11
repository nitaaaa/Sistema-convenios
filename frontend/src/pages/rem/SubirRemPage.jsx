import { useState, useCallback } from 'react';
import { Alert, Container, Card, Spinner } from 'react-bootstrap';
import './SubirRemPage.css';
import { subirRemArchivos } from '../../services/remService';

function SubirRemPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [detalles, setDetalles] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateFile = (file) => {
    if (!file) return false;
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-excel.sheet.macroEnabled.12' // .xlsm
    ];
    const validExtensions = ['.xlsx', '.xls', '.xlsm'];
    const fileName = file.name ? file.name.toLowerCase() : '';
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    return validTypes.includes(file.type) || hasValidExtension;
  }; 

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(validateFile);
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setError('');
    } else {
      setError('Por favor, sube archivos Excel válidos (.xlsx, .xls o .xlsm)');
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(validateFile);
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setError('');
    } else {
      setError('Por favor, sube archivos Excel válidos (.xlsx, .xls o .xlsm)');
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDetalles(null);
    setSuccess('');
    if (files.length === 0) {
      setError('Por favor, selecciona al menos un archivo');
      return;
    }
    setLoading(true);
    try {
      const resp = await subirRemArchivos(files);
      console.log(resp.status);
      if(resp.status === 200){
        setSuccess(resp.mensaje || 'Archivos subidos exitosamente');
        setDetalles(null);
        setFiles([]);
        setError('');
      } else if (resp.status === 207) {
        setSuccess('');
        setDetalles(resp);
        setFiles([]);
        setError('Algunos archivos no fueron guardados');
      } else {
        console.log('resp.status ', resp.status);
        console.log(resp)
        setError('Error al subir los archivos: ' + (resp.mensaje || resp.message || 'Error desconocido'));
        setDetalles(null);
      }
    } catch (err) {
        setError('Error al subir los archivos: ' + (err.mensaje || err.message || 'Error desconocido'));
       
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Subir Archivos REM</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {detalles && detalles.archivosNoGuardados && detalles.archivosNoGuardados.length > 0 && (
        <Alert variant="warning" className="mt-2">
          <strong>Detalle de archivos no guardados:</strong>
          <ul className="mb-0">
            {detalles.archivosNoGuardados.map((item, idx) => (
              <li key={idx}><b>{item.archivo}:</b> {item.motivo}</li>
            ))}
          </ul>
          {detalles.archivosGuardados && detalles.archivosGuardados.length > 0 && (
            <div className="mt-2">
              <strong>Archivos guardados correctamente:</strong>
              <ul className="mb-0">
                {detalles.archivosGuardados.map((nombre, idx) => (
                  <li key={idx}>{nombre}</li>
                ))}
              </ul>
            </div>
          )}
        </Alert>
      )}
      <Card className={`upload-container ${isDragging ? 'dragging' : ''}`}>
        <Card.Body
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="text-center p-5"
        >
          <div className="upload-content">
            <i className="bi bi-file-earmark-excel upload-icon"></i>
            <h4>Arrastra y suelta tus archivos REM aquí</h4>
            <p className="text-muted">o</p>
            <label className="btn btn-primary">
              Seleccionar archivos
              <input
                type="file"
                accept=".xlsx,.xls,.xlsm"
                multiple
                onChange={handleFileChange}
                className="d-none"
                disabled={loading}
              />
            </label>
            {loading ? (
              <div className="mt-4 d-flex flex-column align-items-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p className="mt-2">Subiendo archivos...</p>
              </div>
            ) : files.length > 0 && (
              <div className="mt-3">
                <ul className="list-unstyled">
                  {files.map((file, idx) => (
                    <li key={idx} className="mb-1 d-flex align-items-center justify-content-center">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={() => handleRemoveFile(idx)}
                        title="Quitar archivo"
                        disabled={loading}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  Subir Archivos
                </button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default SubirRemPage; 