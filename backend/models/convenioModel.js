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

async function crearCuota({ fecha, convenioId }, connection) {
  const [result] = await connection.execute(
    'INSERT INTO cuotas (fecha, convenio_id) VALUES (?, ?)',
    [fecha, convenioId]
  );
  return result;
}

async function crearDescuento({ cuotaId, techo, descuento }, connection) {
  const [result] = await connection.execute(
    'INSERT INTO descuentos (cuotas_id, techo, descuento) VALUES (?, ?, ?)',
    [cuotaId, techo, descuento]
  );
  return result;
}

async function getCuotasPorConvenio(convenioId) {
  const [rows] = await db.execute(
    'SELECT id, fecha FROM cuotas WHERE convenio_id = ? ORDER BY fecha',
    [convenioId]
  );
  return rows;
}

async function getDescuentosPorCuota(cuotaId) {
  const [rows] = await db.execute(
    'SELECT id, techo, descuento FROM descuentos WHERE cuotas_id = ? ORDER BY techo',
    [cuotaId]
  );
  return rows;
}

async function actualizarDatosConvenio({ id, nombre, descripcion, fechaInicio, fechaFin, monto }, connection) {
  const [result] = await connection.execute(
    'UPDATE convenios SET nombre = ?, descripcion = ?, inicio = ?, termino = ?, monto = ? WHERE id = ?',
    [nombre, descripcion, fechaInicio, fechaFin, monto, id]
  );
  return result;
}

async function eliminarCuotasConvenio(convenioId, connection) {
  // Primero eliminar los descuentos asociados a las cuotas
  await connection.execute(
    'DELETE d FROM descuentos d INNER JOIN cuotas c ON d.cuotas_id = c.id WHERE c.convenio_id = ?',
    [convenioId]
  );
  
  // Luego eliminar las cuotas
  const [result] = await connection.execute(
    'DELETE FROM cuotas WHERE convenio_id = ?',
    [convenioId]
  );
  return result;
}

async function eliminarComponentesConvenio(convenioId, connection) {
  // Primero eliminar las fórmulas asociadas a los indicadores
  await connection.execute(
    'DELETE fc FROM formula_calculo fc INNER JOIN indicadores i ON fc.Indicadores_id = i.id INNER JOIN componentes c ON i.Componentes_id = c.id WHERE c.convenios_id = ?',
    [convenioId]
  );
  
  // Luego eliminar los indicadores
  await connection.execute(
    'DELETE i FROM indicadores i INNER JOIN componentes c ON i.Componentes_id = c.id WHERE c.convenios_id = ?',
    [convenioId]
  );
  
  // Finalmente eliminar los componentes
  const [result] = await connection.execute(
    'DELETE FROM componentes WHERE convenios_id = ?',
    [convenioId]
  );
  return result;
}

module.exports = { 
  crearConvenio, 
  getConveniosPorAnio, 
  getConvenioPorId, 
  crearCuota, 
  crearDescuento,
  getCuotasPorConvenio,
  getDescuentosPorCuota,
  actualizarDatosConvenio,
  eliminarCuotasConvenio,
  eliminarComponentesConvenio
}; 