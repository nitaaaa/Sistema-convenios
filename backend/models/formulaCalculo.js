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

module.exports = { crearFormulaCalculo, getFormulasPorIndicador }; 