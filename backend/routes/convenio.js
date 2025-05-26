const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const { createConvenio } = require('../controllers/convenioController');
const { getConveniosPorAnio } = require('../controllers/convenioController');
const { componentesPorConvenio, indicadoresPorComponente, formulasPorIndicador, calcularResultadosPorMes } = require('../controllers/convenioController');

// Crear convenio
router.post('/', verifyToken, createConvenio);

// Obtener convenios por año
router.get('/anio/:anio', verifyToken, getConveniosPorAnio);

// Obtener componentes de un convenio
router.get('/:convenioId/componentes', verifyToken, componentesPorConvenio);

// Obtener indicadores de un componente
router.get('/componentes/:componenteId/indicadores', verifyToken, indicadoresPorComponente);

// Obtener fórmulas de cálculo de un indicador
router.get('/indicadores/:indicadorId/formulas', verifyToken, formulasPorIndicador);

// Calcular resultados de fórmulas por mes
router.get('/reportes/calculo', verifyToken, calcularResultadosPorMes);

module.exports = router; 