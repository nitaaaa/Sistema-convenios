const db = require('../config/database');

async function crearComponente({ nombre, convenioId }, connection = db) {
  const [result] = await connection.execute(
    'INSERT INTO componentes (nombre, Convenios_id) VALUES (?, ?)',
    [nombre, convenioId]
  );
  return result;
}

module.exports = { crearComponente };
