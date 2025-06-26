import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ReportesPage from './pages/ReportesPage'
import CrearConvenioPage from './pages/convenios/CrearConvenioPage'
import ModificarConvenioPage from './pages/convenios/ModificarConvenioPage'
import EliminarConvenioPage from './pages/convenios/EliminarConvenioPage'
import CrearUsuarioPage from './pages/usuarios/CrearUsuarioPage'
import EditarUsuarioPage from './pages/usuarios/EditarUsuarioPage'
import RestablecerContrasenaPage from './pages/usuarios/RestablecerContrasenaPage'
import SubirRemPage from './pages/rem/SubirRemPage'
import VerRemPage from './pages/rem/VerRemPage'
import CrearEstablecimientoPage from './pages/establecimientos/CrearEstablecimientoPage'
import './App.css'
import AppNavbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import useSessionTimeout from './hooks/useSessionTimeout'

function AppContent() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login' || location.pathname === '/'

  // Implementar el hook de timeout de sesión
  useSessionTimeout()

  return (
    <>
      {!isLoginPage && <AppNavbar />}
      <main className="container-fluid py-4">
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
            <Route path="/usuarios/restablecer-contrasena" element={<RestablecerContrasenaPage />} />
            {/* REM */}
            <Route path="/rem/subir" element={<SubirRemPage />} />
            <Route path="/rem/ver" element={<VerRemPage />} />
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
