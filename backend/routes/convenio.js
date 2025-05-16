const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const { createConvenio } = require('../controllers/convenioController');

// Crear convenio
router.post('/', verifyToken, createConvenio);

module.exports = router; 