const db = require('../config/database');

async function getAllRems() {
  const [rems] = await db.execute('SELECT id FROM rem');
  return rems;
}

async function getFormulaIdsByConvenio(convenioId) {
  const [formulas] = await db.execute(`
    SELECT fc.id AS formula_id
    FROM formula_calculo fc
    INNER JOIN indicadores i ON fc.Indicadores_id = i.id
    INNER JOIN componentes c ON i.Componentes_id = c.id
    WHERE c.Convenios_id = ?
  `, [convenioId]);
  return formulas.map(f => f.formula_id);
}

async function getFormulaIdsAplicadasPorRem(remId) {
  const [aplicadas] = await db.execute(
    'SELECT formula_calculo_id FROM resultados_calculo WHERE rem_id = ?',
    [remId]
  );
  return aplicadas.map(a => a.formula_calculo_id);
}

async function getFormulaIdsValidasPorFecha(fecha) {
  const [formulas] = await db.execute(`
    SELECT fc.id AS formula_id
    FROM formula_calculo fc
    INNER JOIN indicadores i ON fc.Indicadores_id = i.id
    INNER JOIN componentes c ON i.Componentes_id = c.id
    INNER JOIN convenios cv ON c.Convenios_id = cv.id
    WHERE ? BETWEEN cv.inicio AND cv.termino
  `, [fecha]);
  return formulas.map(f => f.formula_id);
}

async function getFormulaById(formulaId) {
  const [formulas] = await db.execute(`
    SELECT fc.id, fc.numerador, fc.denominador, i.fuente
    FROM formula_calculo fc
    INNER JOIN indicadores i ON fc.Indicadores_id = i.id
    WHERE fc.id = ?
  `, [formulaId]);
  return formulas[0];
}

async function guardarResultadoCalculo(remId, formulaId, resultado) {
  const [result] = await db.execute(
    'INSERT INTO resultados_calculo (rem_id, formula_calculo_id, resultado) VALUES (?, ?, ?)',
    [remId, formulaId, resultado]
  );
  return result;
}

module.exports = {
  getAllRems,
  getFormulaIdsByConvenio,
  getFormulaIdsAplicadasPorRem,
  getFormulaIdsValidasPorFecha,
  getFormulaById,
  guardarResultadoCalculo
}; 