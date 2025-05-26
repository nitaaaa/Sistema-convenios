const db = require('../config/database');

async function crearComponente({ nombre, convenioId }, connection = db) {
  const [result] = await connection.execute(
    'INSERT INTO componentes (nombre, Convenios_id) VALUES (?, ?)',
    [nombre, convenioId]
  );
  return result;
}

async function getComponentesPorConvenio(convenioId) {
  const [rows] = await db.execute(
    'SELECT * FROM componentes WHERE Convenios_id = ?',
    [convenioId]
  );
  return rows;
}

module.exports = { crearComponente, getComponentesPorConvenio };
