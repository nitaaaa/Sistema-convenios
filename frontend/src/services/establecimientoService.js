import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const obtenerEstablecimientoPorId = async (id) => {
  const token = localStorage.getItem('authToken');
  const response = await axios.get(`${API_URL}/establecimientos/info/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const obtenerTodosLosEstablecimientosPM = async (comunaId = 1) => { //PM por Puerto Montt
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${API_URL}/establecimientos/${comunaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener los establecimientos');
  }
}; 