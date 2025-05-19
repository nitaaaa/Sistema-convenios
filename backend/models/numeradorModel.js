const db = require('../config/database');

async function crearNumerador({ titulo, numerador, indicadorId }, connection = db) {
  const [result] = await connection.execute(
    'INSERT INTO numeradores (titulo, numerador, Indicadores_id) VALUES (?, ?, ?)',
    [titulo, numerador, indicadorId]
  );
  return result;
}

module.exports = { crearNumerador }; 