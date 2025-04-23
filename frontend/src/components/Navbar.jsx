import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function AppNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userData.nombre || 'Usuario';

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
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
              <NavDropdown.Item href="/usuarios/crear">Crear</NavDropdown.Item>
              <NavDropdown.Item href="/usuarios">Lista de Usuarios</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          
          <Nav>
            <NavDropdown title={userName} id="user-dropdown" align="end">
              <NavDropdown.Item onClick={handleLogout}>Cerrar Sesión</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
