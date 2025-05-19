const db = require('../config/database');

async function crearIndicador({ nombre, denominador, pesoFinal, fuente, componenteId }, connection = db) {
  const [result] = await connection.execute(
    'INSERT INTO indicadores (nombre, denominador, peso_final, fuente, Componentes_id) VALUES (?, ?, ?, ?, ?)',
    [nombre, denominador, pesoFinal, fuente, componenteId]
  );
  return result;
}

module.exports = { crearIndicador }; 