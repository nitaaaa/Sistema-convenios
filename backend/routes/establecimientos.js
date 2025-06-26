const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const { crearEstablecimiento } = require('../models/establecimientoModel');
const { subirExcel, getEstablecimientos, getEstablecimientosPorComuna, getEstablecimientosDependientes } = require('../controllers/establecimientosController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { buscarUsuariosPorEstablecimiento } = require('../models/establecimientoModel');
const { getEstablecimientosPorUsuario } = require('../controllers/establecimientosController');

// Crear establecimiento
router.post('/nuevo', verifyToken, async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }
  try {
    await crearEstablecimiento(nombre);
    res.status(201).json({ message: 'Establecimiento creado exitosamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El establecimiento ya existe' });
    }
    res.status(500).json({ message: 'Error al crear el establecimiento' });
  }
});

// Obtener todos los establecimientos
router.get('/', verifyToken, getEstablecimientos);

// Obtener establecimientos por comunas_id
router.get('/:comunas_id', verifyToken, getEstablecimientosPorComuna);

// Obtener usuarios por establecimiento
router.get('/usuarios/:idEstablecimiento', verifyToken, async (req, res) => {
  const { idEstablecimiento } = req.params;
  try {
    const usuarios = await buscarUsuariosPorEstablecimiento(idEstablecimiento);
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al buscar usuarios por establecimiento' });
  }
});

// Obtener establecimientos dependientes de un establecimiento
router.get('/dependientes/:id', verifyToken, getEstablecimientosDependientes);

// Obtener datos de un establecimiento por su id
router.get('/info/:id', verifyToken, require('../controllers/establecimientosController').getEstablecimientoPorId);

// Obtener establecimientos por usuario
router.get('/usuario/:rut', getEstablecimientosPorUsuario);

module.exports = router; 