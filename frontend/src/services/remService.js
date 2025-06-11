import axios from 'axios';

export const subirRemArchivos = async (archivos) => {
  const formData = new FormData();
  archivos.forEach((archivo) => {
    formData.append('files', archivo);
  });
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.post(`/api/rem/subir`, formData, {
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