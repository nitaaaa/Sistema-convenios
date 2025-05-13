const db = require('../config/database');

const crearUsuario = async ({ nombres, apellidoPaterno, apellidoMaterno, rut, correo, establecimiento }) => {
  const [result] = await db.execute(
    'INSERT INTO usuarios (nombres, apellido_paterno, apellido_materno, rut, correo) VALUES (?, ?, ?, ?, ?)',
    [nombres, apellidoPaterno, apellidoMaterno, rut, correo]
  );
  return result;
};

const editarUsuario = async (id, { nombres, apellidoPaterno, apellidoMaterno, rut, correo, establecimiento }) => {
  const [result] = await db.execute(
    'UPDATE usuarios SET nombres = ?, apellido_paterno = ?, apellido_materno = ?, rut = ?, correo = ? WHERE id = ?',
    [nombres, apellidoPaterno, apellidoMaterno, rut, correo, id]
  );
  return result;
};

const obtenerUsuarioPorId = async (id) => {
  const [rows] = await db.execute(
    'SELECT * FROM usuarios WHERE id = ?',
    [id]
  );
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

module.exports = { crearUsuario, editarUsuario, obtenerUsuarioPorId, listarUsuarios, buscarUsuarioPorCorreo, buscarUsuariosPorEstablecimiento, buscarEstablecimientosPorUsuario };