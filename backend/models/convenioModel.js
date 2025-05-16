const db = require('../config/database');

async function crearConvenio({ nombre, descripcion, fechaInicio, fechaFin, monto, establecimiento }) {
  const [result] = await db.execute(
    'INSERT INTO convenios (nombre, descripcion, fecha_inicio, fecha_fin, monto, establecimiento) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, descripcion, fechaInicio, fechaFin, monto, establecimiento]
  );
  return result;
}

module.exports = { crearConvenio }; 