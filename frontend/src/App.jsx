import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ReportesPage from './pages/ReportesPage'
import CrearConvenioPage from './pages/convenios/CrearConvenioPage'
import ModificarConvenioPage from './pages/convenios/ModificarConvenioPage'
import EliminarConvenioPage from './pages/convenios/EliminarConvenioPage'
import ListaUsuariosPage from './pages/usuarios/ListaUsuariosPage'
import CrearUsuarioPage from './pages/usuarios/CrearUsuarioPage'
import EditarUsuarioPage from './pages/usuarios/EditarUsuarioPage'
import './App.css'
import AppNavbar from './components/Navbar'

function AppContent() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login' || location.pathname === '/'

  return (
    <>
      {!isLoginPage && <AppNavbar />}
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          
          {/* Rutas de Convenios */}
          <Route path="/convenios/crear" element={<CrearConvenioPage />} />
          <Route path="/convenios/modificar" element={<ModificarConvenioPage />} />
          <Route path="/convenios/eliminar" element={<EliminarConvenioPage />} />
          
          {/* Rutas de Usuarios */}
          <Route path="/usuarios" element={<ListaUsuariosPage />} />
          <Route path="/usuarios/crear" element={<CrearUsuarioPage />} />
          <Route path="/usuarios/editar/:id" element={<EditarUsuarioPage />} />
          
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </main>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
