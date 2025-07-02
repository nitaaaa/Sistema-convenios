// frontend/constans.js - Constantes para el frontend (ES6 modules)

// Tiempo de sesión en milisegundos (copiadas del archivo shared)
export const SESSION_DURATION = 60 * 60 * 1000; // 1 hora
export const MAX_SESSION_TIME = 8 * 60 * 60 * 1000; // 8 horas
export const WARNING_TIME = 5 * 60 * 1000; // 5 minutos

// Tiempo de sesión en segundos (para JWT)
export const JWT_EXPIRATION = Math.floor(SESSION_DURATION / 1000); // 3600 segundos = 1 hora

// Constantes específicas del frontend
export const SERVER_URL = 'http://192.168.3.111:3001';
export const EXPIRATION_TIME = Date.now() + SESSION_DURATION; // Tiempo de expiración de la sesión: 1 hora
export const ordenMeses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];