const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const { createConvenio } = require('../controllers/convenioController');
const { obtenerConveniosPorAnio, obtenerConvenioPorId, actualizarConvenio, eliminarConvenioController } = require('../controllers/convenioController');
const { componentesPorConvenio, indicadoresPorComponente, formulasPorIndicador, calcularResultadosPorMes, getFechasValidez } = require('../controllers/convenioController');

// Crear convenio
router.post('/', verifyToken, createConvenio);

// Obtener convenios por año
router.get('/anio/:anio', verifyToken, obtenerConveniosPorAnio);

// Obtener convenio por ID
router.get('/:convenioId', verifyToken, obtenerConvenioPorId);

// Actualizar convenio
router.put('/:convenioId', verifyToken, actualizarConvenio);

// Eliminar convenio
router.delete('/:convenioId', verifyToken, eliminarConvenioController);

// Obtener fechas de validez de un convenio
router.get('/:convenioId/fechas', verifyToken, getFechasValidez);

// Obtener componentes de un convenio
router.get('/:convenioId/componentes', verifyToken, componentesPorConvenio);

// Obtener indicadores de un componente
router.get('/componentes/:componenteId/indicadores', verifyToken, indicadoresPorComponente);

// Obtener fórmulas de cálculo de un indicador
router.get('/indicadores/:indicadorId/formulas', verifyToken, formulasPorIndicador);

// Calcular resultados de fórmulas por mes
router.get('/reportes/calculo', verifyToken, calcularResultadosPorMes);

module.exports = router; 