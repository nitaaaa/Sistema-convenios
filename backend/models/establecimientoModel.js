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

async function buscarUsuariosPorEstablecimiento(establecimientoId) {
  const [rows] = await db.execute(
    `SELECT u.* FROM usuarios u
     INNER JOIN establecimientos_usuarios eu ON u.rut = eu.Usuarios_rut
     WHERE eu.Establecimientos_id = ?`,
    [establecimientoId]
  );
  return rows;
}

async function listarEstablecimientosDependientes(establecimientos_id) {
  const [rows] = await db.execute('SELECT * FROM establecimientos WHERE establecimiento_id = ?', [establecimientos_id]);
  return rows;
}

async function obtenerEstablecimientoPorId(id) {
  const [rows] = await db.execute('SELECT * FROM establecimientos WHERE id = ?', [id]);
  return rows[0];
}

async function obtenerEstablecimientosPorUsuario(rut) {
  const [rows] = await db.execute(
    `SELECT e.* FROM establecimientos e
     INNER JOIN establecimientos_usuarios eu ON e.id = eu.Establecimientos_id
     WHERE eu.Usuarios_rut = ?`,
    [rut]
  );
  return rows;
}

module.exports = { crearEstablecimiento, listarEstablecimientos, listarEstablecimientosPorComuna, buscarEstablecimientoPorNombreYComuna, buscarUsuariosPorEstablecimiento, listarEstablecimientosDependientes, obtenerEstablecimientoPorId, obtenerEstablecimientosPorUsuario }; 