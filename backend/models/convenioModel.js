const db = require('../config/database');

async function crearConvenio({ nombre, descripcion, inicio, termino, monto }, connection = db) {
  // Convertir fechas ISO a formato YYYY-MM-DD para MySQL
  let inicioFormateado = inicio;
  let terminoFormateado = termino;
  
  if (inicio && inicio.includes('T')) {
    try {
      const date = new Date(inicio);
      inicioFormateado = date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formateando fecha de inicio:', error);
      throw new Error('Formato de fecha de inicio inválido');
    }
  }
  
  if (termino && termino.includes('T')) {
    try {
      const date = new Date(termino);
      terminoFormateado = date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formateando fecha de fin:', error);
      throw new Error('Formato de fecha de fin inválido');
    }
  }
  
  const [result] = await connection.execute(
    'INSERT INTO convenios (nombre, descripcion, inicio, termino, monto) VALUES ( ?, ?, ?, ?, ?)',
    [nombre, descripcion, inicioFormateado, terminoFormateado, monto]
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
  // Convertir fecha ISO a formato YYYY-MM-DD para MySQL
  let fechaFormateada = fecha;
  if (fecha && fecha.includes('T')) {
    try {
      const date = new Date(fecha);
      fechaFormateada = date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formateando fecha para MySQL:', error);
      throw new Error('Formato de fecha inválido');
    }
  }
  
  const [result] = await connection.execute(
    'INSERT INTO cuotas (fecha, convenio_id) VALUES (?, ?)',
    [fechaFormateada, convenioId]
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
    'SELECT id, fecha as fechaRendicion FROM cuotas WHERE convenio_id = ? ORDER BY fecha',
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

async function actualizarDatosConvenio(datos, connection) {
  const { id, nombre, descripcion, inicio, termino, monto } = datos;
  
  // Construir la consulta SQL dinámicamente basada en los campos proporcionados
  const campos = [];
  const valores = [];
  
  if (nombre !== undefined) {
    campos.push('nombre = ?');
    valores.push(nombre);
  }
  
  if (descripcion !== undefined) {
    campos.push('descripcion = ?');
    valores.push(descripcion);
  }
  
  if (inicio !== undefined) {
    // Convertir fecha ISO a formato YYYY-MM-DD para MySQL
    let inicioFormateado = inicio;
    if (inicio && inicio.includes('T')) {
      try {
        const date = new Date(inicio);
        inicioFormateado = date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formateando fecha de inicio:', error);
        throw new Error('Formato de fecha de inicio inválido');
      }
    }
    campos.push('inicio = ?');
    valores.push(inicioFormateado);
  }
  
  if (termino !== undefined) {
    // Convertir fecha ISO a formato YYYY-MM-DD para MySQL
    let terminoFormateado = termino;
    if (termino && termino.includes('T')) {
      try {
        const date = new Date(termino);
        terminoFormateado = date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formateando fecha de fin:', error);
        throw new Error('Formato de fecha de fin inválido');
      }
    }
    campos.push('termino = ?');
    valores.push(terminoFormateado);
  }
  
  if (monto !== undefined) {
    campos.push('monto = ?');
    valores.push(monto);
  }
  
  // Si no hay campos para actualizar, retornar sin hacer nada
  if (campos.length === 0) {
    return { affectedRows: 0 };
  }
  
  // Agregar el ID al final de los valores
  valores.push(id);
  
  const query = `UPDATE convenios SET ${campos.join(', ')} WHERE id = ?`;
  const [result] = await connection.execute(query, valores);
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

async function eliminarConvenio(convenioId, connection = db) {
  const conn = connection || await db.getConnection();
  const isTransaction = !connection;
  
  try {
    if (isTransaction) {
      await conn.beginTransaction();
    }
    
    // 1. Eliminar cuotas y descuentos del convenio
    await eliminarCuotasConvenio(convenioId, conn);
    
    // 2. Eliminar componentes, indicadores y fórmulas del convenio
    await eliminarComponentesConvenio(convenioId, conn);
    
    // 3. Finalmente eliminar el convenio
    const [result] = await conn.execute(
      'DELETE FROM convenios WHERE id = ?',
      [convenioId]
    );
    
    if (isTransaction) {
      await conn.commit();
    }
    
    return result;
  } catch (error) {
    if (isTransaction) {
      await conn.rollback();
    }
    throw error;
  } finally {
    if (isTransaction && conn) {
      conn.release();
    }
  }
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
  eliminarComponentesConvenio,
  eliminarConvenio
}; 