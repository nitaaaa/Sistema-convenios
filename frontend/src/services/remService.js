import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const subirRemArchivos = async (archivos) => {
  const formData = new FormData();
  archivos.forEach((archivo) => {
    formData.append('files', archivo);
  });
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.post(`${API_URL}/rem/subir`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status >= 200 && status < 300 || status === 207
    });
    return { status: response.status, ...response.data };
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

export const obtenerArchivosRem = async (establecimientoId, mes, ano) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${API_URL}/rem/archivos`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        establecimientoId: establecimientoId || '',
        mes: mes || '',
        ano: ano || ''
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener los archivos REM');
  }
};

export const eliminarArchivoRem = async (id) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.delete(`${API_URL}/rem/eliminar/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al eliminar el archivo REM');
  }
};  