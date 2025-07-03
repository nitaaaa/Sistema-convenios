import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useSessionTimeout from '../hooks/useSessionTimeout';
import './Navbar.css';
import DESAMBlanco from '../assets/DESAM-blanco.png';

function AppNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState(0);

  // Formatea el tiempo en mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Actualizar el tiempo restante cada segundo
  useEffect(() => {
    const updateTimer = () => {
      const expiresAt = localStorage.getItem('expiresAt');
      if (expiresAt) {
        const diff = Math.max(0, Math.floor((Number(expiresAt) - Date.now()) / 1000));
        setTimeLeft(diff);
      } else {
        setTimeLeft(0);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

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
              <NavDropdown.Item href="/usuarios/restablecer-contrasena">Restablecer Contraseña</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="Establecimientos" id="establecimientos-dropdown">
              
              
              <NavDropdown.Item href="/establecimientos/crear">Crear Establecimiento</NavDropdown.Item>
              <NavDropdown.Item href="/establecimientos/editar">Editar Establecimiento</NavDropdown.Item>
              <NavDropdown.Item href="/establecimientos/eliminar">Eliminar Establecimiento</NavDropdown.Item>
              
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
            <NavDropdown title={user?.nombres || 'Usuario'} id="user-dropdown" align="end">
              <NavDropdown.Item href="/usuarios/perfil">Mi Perfil</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout}>Cerrar Sesión</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
