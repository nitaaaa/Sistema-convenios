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

async function actualizarEstablecimiento(id, nombre, establecimientoPadreId = null) {
  const [result] = await db.execute(
    'UPDATE establecimientos SET nombre = ?, establecimiento_id = ? WHERE id = ?',
    [nombre, establecimientoPadreId, id]
  );
  return result;
}

async function eliminarEstablecimiento(id) {
  // Verificar si el establecimiento tiene dependientes
  const [dependientes] = await db.execute(
    'SELECT COUNT(*) as count FROM establecimientos WHERE establecimiento_id = ?',
    [id]
  );
  
  if (dependientes[0].count > 0) {
    throw new Error('No se puede eliminar el establecimiento porque tiene establecimientos dependientes');
  }
  
  // Verificar si el establecimiento tiene usuarios asociados
  const [usuarios] = await db.execute(
    'SELECT COUNT(*) as count FROM establecimientos_usuarios WHERE Establecimientos_id = ?',
    [id]
  );
  
  if (usuarios[0].count > 0) {
    throw new Error('No se puede eliminar el establecimiento porque tiene usuarios asociados');
  }
  
  // Verificar si el establecimiento tiene archivos REM asociados
  const [rem] = await db.execute(
    'SELECT COUNT(*) as count FROM rem WHERE Establecimientos_id = ?',
    [id]
  );
  
  if (rem[0].count > 0) {
    throw new Error('No se puede eliminar el establecimiento porque tiene archivos REM asociados');
  }
  
  // Si pasa todas las validaciones, eliminar el establecimiento
  const [result] = await db.execute(
    'DELETE FROM establecimientos WHERE id = ?',
    [id]
  );
  
  return result;
}

module.exports = { crearEstablecimiento, listarEstablecimientos, listarEstablecimientosPorComuna, buscarEstablecimientoPorNombreYComuna, buscarUsuariosPorEstablecimiento, listarEstablecimientosDependientes, obtenerEstablecimientoPorId, obtenerEstablecimientosPorUsuario, actualizarEstablecimiento, eliminarEstablecimiento }; 