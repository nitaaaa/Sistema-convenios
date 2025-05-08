import { Navigate, Outlet } from 'react-router-dom';
import { EXPIRATION_TIME } from '../../constans';

function ProtectedRoute() {
  const token = localStorage.getItem('authToken');
  const expiresAt = localStorage.getItem('expiresAt');

  // Si no hay token o expiró la sesión
  if (!token || !expiresAt || Date.now() > Number(expiresAt)) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('userData');
    return <Navigate to="/login" replace />;
  }
  localStorage.setItem('expiresAt', EXPIRATION_TIME);
  return <Outlet />;
}

export default ProtectedRoute;
