const { crearUsuario, editarUsuario, obtenerUsuarioPorId, listarUsuarios, buscarUsuarioPorCorreo, buscarUsuariosPorEstablecimiento, buscarEstablecimientosPorUsuario } = require('../models/usuarioModel');

// Crear usuario
async function crearUsuarioController(req, res) {
  const { nombres, apellidoPaterno, apellidoMaterno, rut, correo, establecimiento } = req.body;
  if (!nombres || !apellidoPaterno || !apellidoMaterno || !rut || !correo || !establecimiento) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }
  try {
    await crearUsuario({ nombres, apellidoPaterno, apellidoMaterno, rut, correo, establecimiento });
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
}

// Editar usuario
async function editarUsuarioController(req, res) {
  const { nombres, apellidoPaterno, apellidoMaterno, rut, correo, establecimiento } = req.body;
  const { id } = req.params;
  if (!nombres || !apellidoPaterno || !apellidoMaterno || !rut || !correo || !establecimiento) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }
  try {
    await editarUsuario(id, { nombres, apellidoPaterno, apellidoMaterno, rut, correo, establecimiento });
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

module.exports = {
  crearUsuarioController,
  editarUsuarioController,
  obtenerUsuarioPorIdController,
  listarUsuariosController,
  buscarUsuarioPorCorreoController,
  buscarEstablecimientosPorUsuarioController,
  buscarComunaDelUsuarioController
}; 