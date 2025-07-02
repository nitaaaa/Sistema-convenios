const db = require('../config/database');
const bcrypt = require('bcryptjs');

const crearUsuario = async ({ nombres, apellidoPaterno, apellidoMaterno, rut, correo, establecimiento, contrasena }) => {
  // Iniciar transacción
  const connection = await db.getConnection();
  await connection.beginTransaction();
  
  try {
    // Encriptar contraseña si se proporciona
    let contrasenaEncriptada = null;
    if (contrasena) {
      const saltRounds = 10;
      contrasenaEncriptada = await bcrypt.hash(contrasena, saltRounds);
    }

    // 1. Insertar usuario
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombres, apellido_paterno, apellido_materno, rut, correo, contrasena) VALUES (?, ?, ?, ?, ?, ?)',
      [nombres, apellidoPaterno, apellidoMaterno, rut, correo, contrasenaEncriptada]
    );

    // 2. Insertar establecimientos asociados si se proporcionan
    
    if (establecimiento && establecimiento.trim()) {
      const establecimientosIds = establecimiento.split(',').map(id => id.trim());
      
      for (const establecimientoId of establecimientosIds) {
        if (establecimientoId) {
          await connection.execute(
            'INSERT INTO establecimientos_usuarios (Usuarios_rut, Establecimientos_id) VALUES (?, ?)',
            [rut, establecimientoId]
          );
        }
      }
    }

    // Confirmar transacción
    await connection.commit();
    return result;
  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    throw error;
  } finally {
    // Liberar conexión
    connection.release();
  }
};

const editarUsuario = async ({ nombres, apellido_paterno, apellido_materno, rut, correo, establecimiento, suspendido }) => {
  // Iniciar transacción
  const connection = await db.getConnection();
  await connection.beginTransaction();
  
  try {
    // 1. Actualizar usuario
    const [result] = await connection.execute(
      'UPDATE usuarios SET nombres = ?, apellido_paterno = ?, apellido_materno = ?, correo = ?, suspendido = ? WHERE rut = ?',
      [nombres, apellido_paterno, apellido_materno, correo, suspendido ? 1 : 0, rut]
    );

    // 2. Eliminar establecimientos asociados existentes
    await connection.execute(
      'DELETE FROM establecimientos_usuarios WHERE Usuarios_rut = ?',
      [rut]
    );

    // 3. Insertar nuevos establecimientos asociados si se proporcionan
    if (establecimiento && establecimiento.trim()) {
      const establecimientosIds = establecimiento.split(',').map(id => id.trim());
      
      for (const establecimientoId of establecimientosIds) {
        if (establecimientoId) {
          await connection.execute(
            'INSERT INTO establecimientos_usuarios (Usuarios_rut, Establecimientos_id) VALUES (?, ?)',
            [rut, establecimientoId]
          );
        }
      }
    }

    // Confirmar transacción
    await connection.commit();
    return result;
  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    throw error;
  } finally {
    // Liberar conexión
    connection.release();
  }
};

const obtenerUsuarioPorId = async (id) => {
  const [rows] = await db.execute(
    'SELECT * FROM usuarios WHERE rut = ?',
    [id]
  );
  
  if (rows[0]) {
    // Obtener establecimientos asociados
    const [establecimientosRows] = await db.execute(
      'SELECT Establecimientos_id FROM establecimientos_usuarios WHERE Usuarios_rut = ?',
      [id]
    );
    
    const establecimientosIds = establecimientosRows.map(row => row.Establecimientos_id);
    rows[0].establecimiento = establecimientosIds.join(', ');
  }
  
  return rows[0];
};

const listarUsuarios = async () => {
  const [rows] = await db.execute('SELECT * FROM usuarios');
  return rows;
};

const buscarUsuarioPorCorreo = async (correo) => {
  const [rows] = await db.execute(
    'SELECT * FROM usuarios WHERE correo = ?',
    [correo]
  );
  return rows[0];
};

const buscarEstablecimientosPorUsuario = async (rutUsuario) => {
  const [rows] = await db.execute(
    `SELECT e.* FROM establecimientos e
     INNER JOIN establecimientos_usuarios eu ON e.id = eu.Establecimientos_id
     WHERE eu.Usuarios_rut = ?`,
    [rutUsuario]
  );
  return rows;
};

const buscarComunaDelUsuario = async (rutUsuario) => {
  const [rows] = await db.execute(
    `SELECT c.* FROM comunas c
     INNER JOIN establecimientos e ON e.Comunas_id = c.id
     INNER JOIN establecimientos_usuarios eu ON eu.Establecimientos_id = e.id
     WHERE eu.Usuarios_rut = ?
     LIMIT 1`,
    [rutUsuario]
  );
  return rows[0];
};

const autenticarUsuario = async (rut, contrasena) => {
  const [rows] = await db.execute(
    'SELECT * FROM usuarios WHERE rut = ? AND (suspendido = 0 OR suspendido IS NULL)',
    [rut]
  );
  
  if (rows.length === 0) {
    return null; // Usuario no encontrado o suspendido
  }
  
  const usuario = rows[0];
  
  // Verificar contraseña
  if (!usuario.contrasena) {
    return null; // Usuario sin contraseña (solo login con Microsoft)
  }
  
  const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
  
  if (!contrasenaValida) {
    return null; // Contraseña incorrecta
  }
  
  // Obtener establecimientos asociados
  const [establecimientosRows] = await db.execute(
    'SELECT Establecimientos_id FROM establecimientos_usuarios WHERE Usuarios_rut = ?',
    [rut]
  );
  
  const establecimientosIds = establecimientosRows.map(row => row.Establecimientos_id);
  
  return {
    ...usuario,
    establecimientos: establecimientosIds
  };
};

const restablecerContrasena = async (rut, nuevaContrasena) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();
  
  try {
    // Encriptar nueva contraseña
    const saltRounds = 10;
    const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, saltRounds);

    // Actualizar contraseña del usuario
    const [result] = await connection.execute(
      'UPDATE usuarios SET contrasena = ? WHERE rut = ?',
      [contrasenaEncriptada, rut]
    );

    if (result.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }

    // Confirmar transacción
    await connection.commit();
    return result;
  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    throw error;
  } finally {
    // Liberar conexión
    connection.release();
  }
};

module.exports = {
  crearUsuario,
  editarUsuario,
  obtenerUsuarioPorId,
  listarUsuarios,
  buscarUsuarioPorCorreo,
  buscarEstablecimientosPorUsuario,
  buscarComunaDelUsuario,
  autenticarUsuario,
  restablecerContrasena
};