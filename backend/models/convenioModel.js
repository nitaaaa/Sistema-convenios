const db = require('../config/database');

async function crearConvenio({ nombre, descripcion, fechaInicio, fechaFin, monto }, connection = db) {
  const [result] = await connection.execute(
    'INSERT INTO convenios (nombre, descripcion, inicio, termino, monto) VALUES ( ?, ?, ?, ?, ?)',
    [nombre, descripcion, fechaInicio, fechaFin, monto]
  );
  return result;
}

async function getConveniosPorAnio(anio) {
  const [rows] = await db.execute(
    'SELECT * FROM convenios WHERE YEAR(inicio) = ?',
    [anio]
  );
  return rows;
}

async function getConvenioPorId(id) {
  const [rows] = await db.execute(
    'SELECT * FROM convenios WHERE id = ?',
    [id]
  );
  return rows[0];
}

module.exports = { crearConvenio, getConveniosPorAnio, getConvenioPorId }; 