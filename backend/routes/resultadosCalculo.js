const express = require('express');
const router = express.Router();
const { 
  obtenerFormulasNoAplicadasPorConvenio,
  obtenerFormulasNoAplicadasPorFecha,
  obtenerResumenFormulasNoAplicadas,
  obtenerFormulasNoAplicadasPorRem
} = require('../controllers/resultadosCalculoController');

// Obtener fórmulas no aplicadas por convenio
router.get('/pendientes/convenio/:convenioId', obtenerFormulasNoAplicadasPorConvenio);

// Obtener fórmulas no aplicadas por fecha
router.get('/pendientes/fecha/:fecha', obtenerFormulasNoAplicadasPorFecha);

// Obtener resumen general de fórmulas no aplicadas
router.get('/resumen', obtenerResumenFormulasNoAplicadas);

// Obtener fórmulas no aplicadas de un REM específico
router.get('/pendientes/rem/:remId', obtenerFormulasNoAplicadasPorRem);

module.exports = router; 