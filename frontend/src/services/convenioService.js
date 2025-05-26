import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const crearConvenio = async (convenioData) => {
  const token = localStorage.getItem('authToken')
  try {
    const response = await axios.post(`${API_URL}/convenios`, convenioData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al crear el convenio')
  }
}

export const obtenerConvenios = async () => {
  try {
    const response = await axios.get(`${API_URL}/convenios`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener los convenios')
  }
}

export const obtenerConvenioPorId = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/convenios/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener el convenio')
  }
}

export const actualizarConvenio = async (id, convenioData) => {
  try {
    const response = await axios.put(`${API_URL}/convenios/${id}`, convenioData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al actualizar el convenio')
  }
}

export const eliminarConvenio = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/convenios/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al eliminar el convenio')
  }
}

export const obtenerConveniosPorAnio = async (anio) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${API_URL}/convenios/anio/${anio}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener los convenios del año');
  }
}

export const obtenerComponentesPorConvenio = async (convenioId) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${API_URL}/convenios/${convenioId}/componentes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener los componentes del convenio');
  }
}

export const obtenerIndicadoresPorComponente = async (componenteId) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${API_URL}/convenios/componentes/${componenteId}/indicadores`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener los indicadores del componente');
  }
}

export const obtenerFormulasPorIndicador = async (indicadorId) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${API_URL}/convenios/indicadores/${indicadorId}/formulas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener las fórmulas del indicador');
  }
} 