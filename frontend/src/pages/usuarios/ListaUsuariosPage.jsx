import { useState, useEffect } from 'react'
import { Container, Table, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

function ListaUsuariosPage() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    // Aquí irá la lógica para cargar la lista de usuarios
    const loadUsuarios = async () => {
      try {
        // Simulación de carga de datos
        setUsuarios([
          {
            id: 1,
            nombre: 'Usuario 1',
            email: 'usuario1@ejemplo.com',
            rol: 'usuario'
          },
          {
            id: 2,
            nombre: 'Admin 1',
            email: 'admin1@ejemplo.com',
            rol: 'admin'
          }
        ])
      } catch (error) {
        setError('Error al cargar la lista de usuarios')
      }
    }

    loadUsuarios()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        // Aquí irá la lógica para eliminar el usuario
        console.log('Eliminando usuario:', id)
        setUsuarios(usuarios.filter(user => user.id !== id))
      } catch (error) {
        setError('Error al eliminar el usuario')
      }
    }
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Usuarios</h2>
        <Button variant="primary" onClick={() => navigate('/usuarios/crear')}>
          Crear Usuario
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.rol}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(usuario.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  )
}

export default ListaUsuariosPage 