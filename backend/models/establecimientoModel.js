const db = require('../config/database'); // Asegúrate de tener este helper para la conexión

async function crearEstablecimiento(nombre) {
  const [result] = await db.execute(
    'INSERT INTO establecimientos (nombre) VALUES (?)',
    [nombre]
  );
  return result;
}

async function listarEstablecimientos() {
  const [rows] = await db.execute('SELECT * FROM establecimientos');
  return rows;
}

async function listarEstablecimientosPorComuna(comunas_id) {
  const [rows] = await db.execute('SELECT * FROM establecimientos WHERE Comunas_id = ?', [comunas_id]);
  return rows;
}

async function buscarEstablecimientoPorNombreYComuna(nombre, comunas_id) {
  const [rows] = await db.execute('SELECT * FROM establecimientos WHERE nombre = ? AND Comunas_id = ?', [nombre, comunas_id]);
  return rows[0];
}

module.exports = { crearEstablecimiento, listarEstablecimientos, listarEstablecimientosPorComuna, buscarEstablecimientoPorNombreYComuna }; 