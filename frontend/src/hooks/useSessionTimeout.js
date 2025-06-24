import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSION_DURATION, MAX_SESSION_TIME, WARNING_TIME } from '../../../shared/constants';

const useSessionTimeout = () => {
  const navigate = useNavigate();

  // Función para reiniciar el timer
  const resetTimer = useCallback(() => {
    const currentTime = Date.now();
    const expiresAt = localStorage.getItem('expiresAt');
    const sessionStart = Number(expiresAt) - SESSION_DURATION;

    // Verificar si no se ha excedido el tiempo máximo de sesión
    if (currentTime - sessionStart < MAX_SESSION_TIME) {
      const newExpiresAt = currentTime + SESSION_DURATION;
      localStorage.setItem('expiresAt', newExpiresAt);
    }
  }, []);

  // Función para manejar el logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('expiresAt');
    navigate('/login');
  }, [navigate]);

  // Función para verificar el tiempo restante
  const checkTimeLeft = useCallback(() => {
    const expiresAt = localStorage.getItem('expiresAt');
    if (expiresAt) {
      const timeLeft = Number(expiresAt) - Date.now();
      
      // Si el tiempo se ha agotado, hacer logout
      if (timeLeft <= 0) {
        handleLogout();
        return;
      }

      // Si quedan menos de 5 minutos, mostrar advertencia
      if (timeLeft <= WARNING_TIME) {
        // Aquí podrías implementar una notificación al usuario
        console.warn(`La sesión expirará en ${Math.floor(timeLeft / 1000 / 60)} minutos`);
      }
    }
  }, [handleLogout]);

  useEffect(() => {
    // Función debounce para evitar demasiadas actualizaciones
    let timeoutId;
    const debouncedReset = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resetTimer, 1000);
    };

    // Agregar event listeners para detectar actividad
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, debouncedReset);
    });

    // Verificar el tiempo cada minuto
    const intervalId = setInterval(checkTimeLeft, 60000);

    // Limpiar event listeners y intervalos al desmontar
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, debouncedReset);
      });
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [resetTimer, checkTimeLeft]);

  return { resetTimer, checkTimeLeft };
};

export default useSessionTimeout; 