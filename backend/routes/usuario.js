const express = require('express');
const router = express.Router();
const { crearUsuario, editarUsuario, obtenerUsuarioPorId, listarUsuarios, buscarUsuarioPorCorreo, buscarUsuariosPorEstablecimiento } = require('../models/usuarioModel');
const verifyToken = require('../middlewares/auth');
const { buscarEstablecimientosPorUsuario } = require('../models/usuarioModel');

// POST /api/usuarios
router.post('/', verifyToken, async (req, res) => {
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
});

// PUT /api/usuarios/:id
router.put('/:id', verifyToken, async (req, res) => {
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
});

// GET /api/usuarios/:id
router.get('/:id', verifyToken, async (req, res) => {
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
});

// GET /api/usuarios
router.get('/', verifyToken, async (req, res) => {
  try {
    const usuarios = await listarUsuarios();
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});

// GET /api/usuarios/correo/:correo
router.get('/correo/:correo', verifyToken, async (req, res) => {
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
});

// Obtener establecimientos por usuario
router.get('/establecimientos/:rut', verifyToken, async (req, res) => {
  const { rut } = req.params;
  try {
    const establecimientos = await buscarEstablecimientosPorUsuario(rut);
    res.json(establecimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al buscar establecimientos por usuario' });
  }
});

module.exports = router;
