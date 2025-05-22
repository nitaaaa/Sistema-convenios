const db = require('../config/database');

async function crearIndicador({ nombre, pesoFinal, fuente, componenteId }, connection = db) {
  const [result] = await connection.execute(
    'INSERT INTO indicadores (nombre, peso_final, fuente, Componentes_id) VALUES (?, ?, ?, ?)',
    [nombre, pesoFinal, fuente, componenteId]
  );
  return result;
}

module.exports = { crearIndicador }; 