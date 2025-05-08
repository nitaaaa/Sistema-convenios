import axios from 'axios';

export const subirRemArchivos = async (archivos) => {
  const formData = new FormData();
  archivos.forEach((archivo) => {
    formData.append('file', archivo);
  });
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.post(`/api/establecimientos/subir-excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status >= 200 && status < 300 || status === 207
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}; 