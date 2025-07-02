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

export const obtenerEstablecimientosPorUsuario = async (rut) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${API_URL}/establecimientos/usuario/${rut}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener los establecimientos del usuario');
  }
};

export const actualizarEstablecimiento = async (id, nombre, establecimientoPadreId = null) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.put(`${API_URL}/establecimientos/${id}`, { 
      nombre, 
      establecimientoPadreId 
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al actualizar el establecimiento');
  }
};

export const eliminarEstablecimiento = async (id) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.delete(`${API_URL}/establecimientos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al eliminar el establecimiento');
  }
}; 