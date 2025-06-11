const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { subirExcel } = require('../controllers/remController');

// Ruta para subir archivos REM
router.post('/subir', upload.array('files'), subirExcel);

module.exports = router; 