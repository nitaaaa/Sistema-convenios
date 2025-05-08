const db = require('../config/database');

async function listarComunas() {
  const [rows] = await db.execute('SELECT * FROM comunas');
  return rows;
}

module.exports = { listarComunas }; 