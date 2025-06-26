const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const {
  crearUsuarioController,
  editarUsuarioController,
  obtenerUsuarioPorIdController,
  listarUsuariosController,
  buscarUsuarioPorCorreoController,
  buscarEstablecimientosPorUsuarioController,
  buscarComunaDelUsuarioController,
  restablecerContrasenaController
} = require('../controllers/usuarioController');

// POST /api/usuarios
router.post('/', verifyToken, crearUsuarioController);

// PUT /api/usuarios/:id
router.put('/:id', verifyToken, editarUsuarioController);

// GET /api/usuarios/:id
router.get('/:id', verifyToken, obtenerUsuarioPorIdController);

// GET /api/usuarios
router.get('/', verifyToken, listarUsuariosController);

// GET /api/usuarios/correo/:correo
router.get('/correo/:correo', verifyToken, buscarUsuarioPorCorreoController);

// Obtener establecimientos por usuario
router.get('/establecimientos/:rut', verifyToken, buscarEstablecimientosPorUsuarioController);

// GET /api/usuarios/comuna/:rut
router.get('/comuna/:rut', verifyToken, buscarComunaDelUsuarioController);

// PUT /api/usuarios/:rut/restablecer-contrasena
router.put('/:rut/restablecer-contrasena', verifyToken, restablecerContrasenaController);

module.exports = router;
