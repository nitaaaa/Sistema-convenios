const db = require('../config/database');

async function listarComunas() {
  const [rows] = await db.execute('SELECT * FROM comunas');
  return rows;
}

async function buscarComunaPorNombre(nombre) {
  const [rows] = await db.execute('SELECT * FROM comunas WHERE nombre = ?', [nombre]);
  return rows[0];
}

module.exports = { listarComunas, buscarComunaPorNombre }; 