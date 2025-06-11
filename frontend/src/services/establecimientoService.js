import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const obtenerEstablecimientoPorId = async (id) => {
  const token = localStorage.getItem('authToken');
  const response = await axios.get(`${API_URL}/establecimientos/info/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}; 