//const { cargarConveniosPorAnio } = require('../../frontend/src/services/convenioService');
const { crearUsuario, editarUsuario, obtenerUsuarioPorId, listarUsuarios, buscarUsuarioPorCorreo, buscarUsuariosPorEstablecimiento, buscarEstablecimientosPorUsuario, restablecerContrasena } = require('../models/usuarioModel');

// Crear usuario
async function crearUsuarioController(req, res) {
  // Permitir ambos formatos de nombre de campo
  const nombres = req.body.nombres;
  const apellidoPaterno = req.body.apellidoPaterno || req.body.apellido_paterno;
  const apellidoMaterno = req.body.apellidoMaterno || req.body.apellido_materno;
  const rut = req.body.rut;
  const correo = req.body.correo;
  const establecimiento = req.body.establecimiento;
  const contrasena = req.body.contrasena;

  
  if (!nombres || !apellidoPaterno || !apellidoMaterno || !rut || !correo) {
    return res.status(400).json({ message: 'Los campos nombres, apellido paterno, apellido materno, RUT y correo son obligatorios' });
  }
  try {
    await crearUsuario({ nombres, apellidoPaterno, apellidoMaterno, rut, correo, establecimiento, contrasena });
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
}

// Editar usuario
async function editarUsuarioController(req, res) {
  const nombres = req.body.nombres;
  const apellido_paterno = req.body.apellido_paterno;
  const apellido_materno = req.body.apellido_materno;
  const rut = req.body.rut;
  const correo = req.body.correo;
  const establecimiento = req.body.establecimiento;
  const suspendido = req.body.suspendido;

  if (!nombres || !apellido_paterno || !apellido_materno || !rut || !correo) {
    return res.status(400).json({ message: 'Los campos nombres, apellido paterno, apellido materno, RUT y correo son obligatorios' });
  }
  
  try {
    await editarUsuario({ nombres, apellido_paterno, apellido_materno, rut, correo, establecimiento, suspendido });
    res.status(200).json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
}

// Obtener usuario por ID
async function obtenerUsuarioPorIdController(req, res) {
  const { id } = req.params;
  try {
    const usuario = await obtenerUsuarioPorId(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
}

// Listar usuarios
async function listarUsuariosController(req, res) {
  try {
    const usuarios = await listarUsuarios();
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
}

// Buscar usuario por correo
async function buscarUsuarioPorCorreoController(req, res) {
  const { correo } = req.params;
  try {
    const usuario = await buscarUsuarioPorCorreo(correo);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al buscar el usuario por correo' });
  }
}

// Buscar establecimientos por usuario
async function buscarEstablecimientosPorUsuarioController(req, res) {
  const { rut } = req.params;
  try {
    const establecimientos = await buscarEstablecimientosPorUsuario(rut);
    res.json(establecimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al buscar establecimientos por usuario' });
  }
}

// Buscar comuna del usuario (debe estar implementada en el modelo)
async function buscarComunaDelUsuarioController(req, res) {
  const { rut } = req.params;
  try {
    const { buscarComunaDelUsuario } = require('../models/usuarioModel');
    const comuna = await buscarComunaDelUsuario(rut);
    res.json(comuna);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al buscar la comuna del usuario' });
  }
}

// Restablecer contraseña de usuario
async function restablecerContrasenaController(req, res) {
  const { rut } = req.params;
  const { nuevaContrasena } = req.body;

  if (!nuevaContrasena || nuevaContrasena.length < 8) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres' });
  }

  try {
    await restablecerContrasena(rut, nuevaContrasena);
    res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
}

module.exports = {
  crearUsuarioController,
  editarUsuarioController,
  obtenerUsuarioPorIdController,
  listarUsuariosController,
  buscarUsuarioPorCorreoController,
  buscarEstablecimientosPorUsuarioController,
  buscarComunaDelUsuarioController,
  restablecerContrasenaController
}; 