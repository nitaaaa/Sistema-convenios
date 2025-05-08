import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const crearConvenio = async (convenioData) => {
  try {
    const response = await axios.post(`${API_URL}/convenios`, convenioData)
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