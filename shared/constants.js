// Tiempo de sesión en milisegundos
const SESSION_DURATION = 60 * 60 * 1000; // 1 hora
const MAX_SESSION_TIME = 8 * 60 * 60 * 1000; // 8 horas
const WARNING_TIME = 5 * 60 * 1000; // 5 minutos

// Tiempo de sesión en segundos (para JWT)
const JWT_EXPIRATION = Math.floor(SESSION_DURATION / 1000); // 3600 segundos = 1 hora

module.exports = {
  SESSION_DURATION,
  MAX_SESSION_TIME,
  WARNING_TIME,
  JWT_EXPIRATION
}; 