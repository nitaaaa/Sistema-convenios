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

export const listarUsuarios = async (token) => {
  return axios.get('/api/usuarios', {
    headers: {
      Authorization: `Bearer ${token}`,
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

export const comunaDelUsuario = async (rut) => {
  const token = localStorage.getItem('authToken')
  return axios.get(`/api/usuarios/comuna/${encodeURIComponent(rut)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const buscarEstablecimientosPorUsuario = async (rut, token) => {
  return axios.get(`/api/usuarios/establecimientos/${encodeURIComponent(rut)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const restablecerContrasena = async (rut, nuevaContrasena, token) => {
  return axios.put(`/api/usuarios/${encodeURIComponent(rut)}/restablecer-contrasena`, 
    { nuevaContrasena }, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}