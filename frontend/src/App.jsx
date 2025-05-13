import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ReportesPage from './pages/ReportesPage'
import CrearConvenioPage from './pages/convenios/CrearConvenioPage'
import ModificarConvenioPage from './pages/convenios/ModificarConvenioPage'
import EliminarConvenioPage from './pages/convenios/EliminarConvenioPage'
import CrearUsuarioPage from './pages/usuarios/CrearUsuarioPage'
import EditarUsuarioPage from './pages/usuarios/EditarUsuarioPage'
import SubirRemPage from './pages/rem/SubirRemPage'
import CrearEstablecimientoPage from './pages/establecimientos/CrearEstablecimientoPage'
import './App.css'
import AppNavbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login' || location.pathname === '/'

  return (
    <>
      {!isLoginPage && <AppNavbar />}
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/reportes" element={<ReportesPage />} />
            {/* Convenios */}
            <Route path="/convenios/crear" element={<CrearConvenioPage />} />
            <Route path="/convenios/modificar" element={<ModificarConvenioPage />} />
            <Route path="/convenios/eliminar" element={<EliminarConvenioPage />} />
            {/* Usuarios */}
            <Route path="/usuarios/crear" element={<CrearUsuarioPage />} />
            <Route path="/usuarios/editar/" element={<EditarUsuarioPage />} />
            {/* REM */}
            <Route path="/rem/subir" element={<SubirRemPage />} />
            {/* Establecimientos */}
            <Route path="/establecimientos/crear" element={<CrearEstablecimientoPage />} />
          </Route>
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
