const { getAllRems, getFormulaIdsByConvenio, getFormulaIdsAplicadasPorRem, getFormulaIdsValidasPorFecha } = require('../models/formulaCalculoModel');

// GET /api/formulas/pendientes/:convenioId
async function remConFormulasPendientesPorConvenio(req, res) {
  const { convenioId } = req.params;
  if (!convenioId) {
    return res.status(400).json({ message: 'Falta el parámetro convenioId' });
  }
  try {
    // 1. Obtener todos los rem
    const rems = await getAllRems();
    // 2. Obtener todos los ids de formulas asociadas al convenio
    const formulaIds = await getFormulaIdsByConvenio(convenioId);
    if (formulaIds.length === 0) {
      return res.json([]); // No hay formulas para este convenio
    }
    // 3. Para cada rem, ver qué formulas faltan
    const resultado = [];
    for (const rem of rems) {
      // Obtener formulas ya aplicadas a este rem
      const aplicadasIds = await getFormulaIdsAplicadasPorRem(rem.id);
      // Calcular faltantes
      const faltantes = formulaIds.filter(fid => !aplicadasIds.includes(fid));
      if (faltantes.length > 0) {
        resultado.push({ rem_id: rem.id, formulas_faltantes: faltantes });
      }
    }
    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las fórmulas pendientes por rem' });
  }
}

// GET /api/formulas/validas/:fecha
async function getFormulaIdsValidasPorFechaController(req, res) {
  const { fecha } = req.params;
  if (!fecha) {
    return res.status(400).json({ message: 'Falta el parámetro fecha' });
  }
  try {
    const formulaIds = await getFormulaIdsValidasPorFecha(fecha);
    res.json(formulaIds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las fórmulas válidas por fecha' });
  }
}

module.exports = { remConFormulasPendientesPorConvenio, getFormulaIdsValidasPorFechaController }; 