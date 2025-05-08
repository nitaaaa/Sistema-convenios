const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const { getComunas } = require('../controllers/comunasController');

// Obtener todas las comunas
router.get('/', verifyToken, getComunas);

module.exports = router; 