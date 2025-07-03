import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { actualizarPerfil, buscarEstablecimientosPorUsuario } from '../../services/usuarioService';
import './MiPerfilPage.css';

function MiPerfilPage() {
  const { user } = useAuth();
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEstablecimientos, setLoadingEstablecimientos] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    rut: '',
    correo: ''
  });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    console.log('Datos del usuario recibidos:', user);
    if (user) {
      setFormData({
        nombres: user.nombres || '',
        apellido_paterno: user.apellido_paterno || '',
        apellido_materno: user.apellido_materno || '',
        rut: user.rut || '',
        correo: user.correo || ''
      });
      cargarEstablecimientos();
    }
  }, [user]);

  const cargarEstablecimientos = async () => {
    if (!user?.rut) return;
    
    try {
      setLoadingEstablecimientos(true);
      const token = localStorage.getItem('authToken');
      const response = await buscarEstablecimientosPorUsuario(user.rut, token);
      setEstablecimientos(response.data);
    } catch (error) {
      console.error('Error al cargar establecimientos:', error);
    } finally {
      setLoadingEstablecimientos(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      await actualizarPerfil(formData, token);
      setSuccess('Perfil actualizado exitosamente');
      setEditing(false);
      
      // Actualizar el contexto de autenticación con los nuevos datos
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      window.location.reload(); // Recargar para actualizar el contexto
    } catch (error) {
      setError(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
    setSuccess('');
    // Restaurar datos originales
    setFormData({
      nombres: user.nombres || '',
      apellido_paterno: user.apellido_paterno || '',
      apellido_materno: user.apellido_materno || '',
      rut: user.rut || '',
      correo: user.correo || ''
    });
  };

  if (!user) {
    return (
      <Container className="mi-perfil-container">
        <Alert variant="warning">No se encontró información del usuario.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mi-perfil-container">
      <div className="mi-perfil-header">
        <h2>Mi Perfil</h2>
        <p>Gestiona tu información personal y configuración de cuenta</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Información del Usuario */}
      <div className="perfil-card">
        <h3>Información Personal</h3>
        
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="form-group">
                <Form.Label className="form-label">Nombres</Form.Label>
                <Form.Control
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="form-group">
                <Form.Label className="form-label">Apellido Paterno</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="form-group">
                <Form.Label className="form-label">Apellido Materno</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="form-group">
                <Form.Label className="form-label">RUT</Form.Label>
                <Form.Control
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  disabled={true} // El RUT no se puede editar
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="form-group">
            <Form.Label className="form-label">Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              disabled={!editing}
              required
            />
          </Form.Group>

          {editing ? (
            <div className="d-flex gap-2">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
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
          ) : (
            <Button 
              type="button" 
              variant="primary" 
              onClick={() => setEditing(true)}
            >
              Editar Perfil
            </Button>
          )}
        </Form>
      </div>

      {/* Información del Sistema */}
      <div className="perfil-card">
        <h3>Información del Sistema</h3>
        
        <div className="info-section">
          <h4>Estado de la Cuenta</h4>
          <div className="info-item">
            <span className="info-label">Estado:</span>
            <span className="info-value">
              {user.suspendido ? (
                <span className="text-danger">Suspendido</span>
              ) : (
                <span className="text-success">Activo</span>
              )}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Tipo de Autenticación:</span>
            <span className="info-value">
              {user.contrasena ? 'Usuario y Contraseña' : 'Microsoft'}
            </span>
          </div>
        </div>

        <div className="info-section">
          <h4>Establecimientos Asociados</h4>
          {loadingEstablecimientos ? (
            <div className="text-center">
              <Spinner animation="border" size="sm" className="me-2" />
              Cargando establecimientos...
            </div>
          ) : establecimientos.length > 0 ? (
            <ul className="establecimientos-list">
              {establecimientos.map((establecimiento) => (
                <li key={establecimiento.id}>
                  {establecimiento.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-0">No hay establecimientos asociados</p>
          )}
        </div>
      </div>

      {/* Acciones Adicionales */}
      <div className="perfil-card">
        <h3>Acciones Adicionales</h3>
        <div className="d-flex gap-2 flex-wrap">
          <Button 
            variant="outline-primary" 
            href="/usuarios/restablecer-contrasena"
          >
            Cambiar Contraseña
          </Button>
          <Button 
            variant="outline-info" 
            onClick={() => window.print()}
          >
            Imprimir Perfil
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default MiPerfilPage; 