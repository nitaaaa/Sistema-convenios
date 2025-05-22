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
  buscarComunaDelUsuarioController
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

module.exports = router;
