const express = require('express');
const router = express.Router();
const { crearUsuario } = require('../models/usuarioModel');
const verifyToken = require('../middlewares/auth');

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

module.exports = router;
