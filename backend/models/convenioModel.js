const db = require('../config/database');

async function crearConvenio({ nombre, descripcion, fechaInicio, fechaFin, monto }, connection = db) {
  const [result] = await connection.execute(
    'INSERT INTO convenios (nombre, descripcion, inicio, termino, monto) VALUES ( ?, ?, ?, ?, ?)',
    [nombre, descripcion, fechaInicio, fechaFin, monto]
  );
  return result;
}

module.exports = { crearConvenio }; 