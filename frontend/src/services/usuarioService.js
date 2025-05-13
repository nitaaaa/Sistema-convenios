import axios from 'axios'

export const crearUsuario = async (formData, token) => {
  return axios.post('/api/usuarios', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const editarUsuario = async (id, formData, token) => {
  return axios.put(`/api/usuarios/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const obtenerUsuarioPorId = async (id, token) => {
  return axios.get(`/api/usuarios/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const listarUsuarios = async (token, rut) => {
  return axios.get('/api/usuarios', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      rut: rut,
    },
  })
}

export const buscarUsuarioPorCorreo = async (correo, token) => {
  return axios.get(`/api/usuarios/correo/${encodeURIComponent(correo)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
} 