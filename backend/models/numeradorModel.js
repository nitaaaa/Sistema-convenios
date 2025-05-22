const db = require('../config/database');

async function crearFormulaCalculo({ titulo, numerador, denominador, indicadorId }, connection = db) {
  const [result] = await connection.execute(
    'INSERT INTO formula_calculo (titulo, numerador, denominador, Indicadores_id) VALUES (?, ?, ?, ?)',
    [titulo, numerador, denominador, indicadorId]
  );
  return result;
}

module.exports = { crearFormulaCalculo }; 