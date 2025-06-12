import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import DESAMBlanco from '../assets/DESAM-blanco.png';

function AppNavbar() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(0);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('expiresAt');
    navigate('/login');
  };

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userData.nombre || 'Usuario';

  // Contador de tiempo restante de sesión
  useEffect(() => {
    const updateTimer = () => {
      const expiresAt = localStorage.getItem('expiresAt');
      if (expiresAt) {
        const diff = Math.max(0, Math.floor((Number(expiresAt) - Date.now()) / 1000));
        setTimeLeft(diff);
        if (diff <= 0) {
          handleLogout();
        }
      } else {
        setTimeLeft(0);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Formatea el tiempo en mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <img
          src={DESAMBlanco}
          alt="DESAM"
          style={{ height: '0px', marginRight: '16px' }}
        />
        <Navbar.Brand href="/reportes">Modulo Convenios</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/reportes">Reportes</Nav.Link>
            
            <NavDropdown title="Gestionar Convenios" id="convenios-dropdown">
              <NavDropdown.Item href="/convenios/crear">Crear</NavDropdown.Item>
              <NavDropdown.Item href="/convenios/modificar">Modificar</NavDropdown.Item>
              <NavDropdown.Item href="/convenios/eliminar">Eliminar</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="Gestionar Usuarios" id="usuarios-dropdown">
              <NavDropdown.Item href="/usuarios/crear">Crear Usuario</NavDropdown.Item>
              <NavDropdown.Item href="/usuarios/editar">Editar Usuario</NavDropdown.Item>
            </NavDropdown>

            {/* Submenú Administrar */}
            <NavDropdown title="Administrar" id="administrar-dropdown">
              <NavDropdown.Header>Comunas</NavDropdown.Header>
              <NavDropdown.Item href="/comunas/agregarConvenio">Agregar convenio</NavDropdown.Item>
              <NavDropdown.Header>Establecimientos</NavDropdown.Header>
              <NavDropdown.Item href="/establecimientos/crear">Crear Establecimiento</NavDropdown.Item>
              <NavDropdown.Item href="/establecimientos/modificar">Modificar Establecimiento</NavDropdown.Item>
              <NavDropdown.Item href="/establecimientos/eliminar">Eliminar Establecimiento</NavDropdown.Item>
              <NavDropdown.Item href="/establecimientos/ver">Ver Establecimientos</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="REM" id="rem-dropdown">
              <NavDropdown.Item href="/rem/subir">Subir REM</NavDropdown.Item>
              <NavDropdown.Item href="/rem/ver">Ver REM</NavDropdown.Item>
              <NavDropdown.Item href="/rem/eliminar">Eliminar REM</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          
          <Nav className="align-items-center">
            <span
              className="text-warning me-3"
              style={{ fontWeight: 'bold', fontSize: '1rem' }}
              title="Tiempo restante antes de que la sesión expire automáticamente"
            >
              {timeLeft > 0 && `Sesión: ${formatTime(timeLeft)}`}
            </span>
            <NavDropdown title={userName} id="user-dropdown" align="end">
              <NavDropdown.Item href="/usuarios/perfil">Mi Perfil</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Cerrar Sesión</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
