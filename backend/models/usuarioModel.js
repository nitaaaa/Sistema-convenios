const db = require('../config/database');

const crearUsuario = async ({ nombres, apellidoPaterno, apellidoMaterno, rut, correo, establecimiento }) => {
  const [result] = await db.execute(
    'INSERT INTO usuarios (nombres, apellido_paterno, apellido_materno, rut, correo) VALUES (?, ?, ?, ?, ?)',
    [nombres, apellidoPaterno, apellidoMaterno, rut, correo]
  );
  return result;
};

module.exports = { crearUsuario };