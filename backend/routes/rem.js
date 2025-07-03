const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { subirExcel, obtenerArchivosRem, descargarArchivoRem, eliminarArchivoRem } = require('../controllers/remController');

// Ruta para subir archivos REM
router.post('/subir', upload.array('files'), subirExcel);

// Ruta para obtener archivos REM filtrados
router.get('/archivos', obtenerArchivosRem);

// Ruta para descargar archivo REM
router.get('/descargar/:id', descargarArchivoRem);

// Ruta para eliminar archivo REM
router.delete('/eliminar/:id', eliminarArchivoRem);

module.exports = router; 