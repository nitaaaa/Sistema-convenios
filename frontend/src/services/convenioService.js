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
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${API_URL}/convenios/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener el convenio');
  }
}

export const actualizarConvenio = async (id, convenioData) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.put(`${API_URL}/convenios/${id}`, convenioData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al actualizar el convenio');
  }
}

export const eliminarConvenio = async (id) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.delete(`${API_URL}/convenios/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al eliminar el convenio');
  }
};

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

export const obtenerResultadosPorMes = async ({ anio, establecimiento, convenioId}) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_URL}/convenios/reportes/calculo`, {
      params: { anio, establecimiento, convenioId },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.log('Error: ', error);
    throw new Error(error.response?.data?.message || 'Error al obtener los resultados por mes');
  }
} 

// Obtener fechas de validez de un convenio
export const getFechasValidez = async (convenioId) => {
  try {
    const response = await axios.get(`${API_URL}/${convenioId}/fechas`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener fechas de validez:', error);
    throw error;
  }
};

// Obtener componentes de un convenio
export const getComponentes = async (convenioId) => {
  try {
    const response = await axios.get(`${API_URL}/${convenioId}/componentes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener componentes:', error);
    throw error;
  }
};

// Obtener indicadores de un componente
export const getIndicadores = async (componenteId) => {
  try {
    const response = await axios.get(`${API_URL}/componentes/${componenteId}/indicadores`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener indicadores:', error);
    throw error;
  }
};

// Obtener fórmulas de un indicador
export const getFormulas = async (indicadorId) => {
  try {
    const response = await axios.get(`${API_URL}/indicadores/${indicadorId}/formulas`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener fórmulas:', error);
    throw error;
  }
};

// Calcular resultados de fórmulas por mes
export const calcularResultadosPorMes = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/reportes/calculo`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al calcular resultados:', error);
    throw error;
  }
};

// Función para cargar convenios por año con manejo de estado
export const cargarConveniosPorAnio = async (anio, setConvenios, setConvenio) => {
  if (anio) {
    try {
      const data = await obtenerConveniosPorAnio(anio);
      setConvenios(data);
      setConvenio(''); // Limpiar selección anterior
    } catch (error) {
      setConvenios([]);
      console.error('Error al cargar convenios:', error);
    }
  } else {
    setConvenios([]);
    setConvenio('');
  }
}; 