const db = require('../config/database');

async function crearFormulaCalculo({ titulo, numerador, denominador, indicadorId }, connection = db) {
  const [result] = await connection.execute(
    'INSERT INTO formula_calculo (titulo, numerador, denominador, Indicadores_id) VALUES (?, ?, ?, ?)',
    [titulo, numerador, denominador, indicadorId]
  );
  return result;
}

async function getFormulasPorIndicador(indicadorId) {
  const [rows] = await db.execute(
    'SELECT * FROM formula_calculo WHERE Indicadores_id = ?',
    [indicadorId]
  );
  return rows;
}

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

async function guardarResultadoCalculo(remId, formulaId, resultado, valor_celda) {
  const [result] = await db.execute(
    'INSERT INTO resultados_calculo (rem_id, formula_calculo_id, resultado, valor_celda) VALUES (?, ?, ?, ?)',
    [remId, formulaId, resultado, valor_celda]
  );
  return result;
}

async function eliminarResultadosPorIndicador(indicadorId, connection = db) {
  const [result] = await connection.execute(`
    DELETE rc FROM resultados_calculo rc
    INNER JOIN formula_calculo fc ON rc.formula_calculo_id = fc.id
    WHERE fc.Indicadores_id = ?
  `, [indicadorId]);
  return result;
}

module.exports = {
  crearFormulaCalculo,
  getFormulasPorIndicador,
  getAllRems,
  getFormulaIdsByConvenio,
  getFormulaIdsAplicadasPorRem,
  getFormulaIdsValidasPorFecha,
  getFormulaById,
  guardarResultadoCalculo,
  eliminarResultadosPorIndicador
}; 