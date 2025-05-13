const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const { crearEstablecimiento } = require('../models/establecimientoModel');
const { subirExcel, getEstablecimientos, getEstablecimientosPorComuna } = require('../controllers/establecimientosController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { buscarUsuariosPorEstablecimiento } = require('../models/establecimientoModel');

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

router.post('/subir-excel', verifyToken, upload.array('file'), subirExcel);

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

module.exports = router; 