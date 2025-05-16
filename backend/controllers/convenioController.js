const { crearConvenio } = require('../models/convenioModel');

async function createConvenio(req, res) {
  const { nombre, descripcion, fechaInicio, fechaFin, monto, establecimiento } = req.body;
  if (!nombre || !fechaInicio || !fechaFin || !monto || !establecimiento) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }
  try {
    const result = await crearConvenio({ nombre, descripcion, fechaInicio, fechaFin, monto, establecimiento });
    res.status(201).json({ message: 'Convenio creado exitosamente', convenioId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el convenio' });
  }
}

module.exports = { createConvenio }; 