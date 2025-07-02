const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { listarEstablecimientos, listarEstablecimientosPorComuna, listarEstablecimientosDependientes, obtenerEstablecimientoPorId, buscarEstablecimientoPorNombreYComuna, obtenerEstablecimientosPorUsuario, actualizarEstablecimiento, eliminarEstablecimiento } = require('../models/establecimientoModel');

exports.getEstablecimientos = async (req, res) => {
  try {
    const establecimientos = await listarEstablecimientos();
    res.json(establecimientos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener establecimientos' });
  }
};

exports.getEstablecimientosPorComuna = async (req, res) => {
  try {
    const { comunas_id } = req.params;
    const establecimientos = await listarEstablecimientosPorComuna(comunas_id);
    res.json(establecimientos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener establecimientos por comuna' });
  }
};

// Obtener establecimientos dependientes de un establecimiento
exports.getEstablecimientosDependientes = async (req, res) => {
  const { id } = req.params;
  try {
    const dependientes = await listarEstablecimientosDependientes(id);
    res.json(dependientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener establecimientos dependientes' });
  }
};

exports.getEstablecimientoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const establecimiento = await obtenerEstablecimientoPorId(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }
    res.json(establecimiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el establecimiento' });
  }
};

exports.getEstablecimientoPorNombreYComuna = async (req, res) => {
  const { nombre, comunas_id } = req.params;
  try {
    const establecimiento = await buscarEstablecimientoPorNombreYComuna(nombre, comunas_id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }
    res.json(establecimiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el establecimiento por nombre y comuna' });
  }
};

exports.getEstablecimientosPorUsuario = async (req, res) => {
  const { rut } = req.params;
  try {
    const establecimientos = await obtenerEstablecimientosPorUsuario(rut);
    res.json(establecimientos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener establecimientos del usuario' });
  }
};

exports.actualizarEstablecimiento = async (req, res) => {
  const { id } = req.params;
  const { nombre, establecimientoPadreId } = req.body;
  
  if (!nombre) {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }
  
  // Validar que no se establezca como padre a sí mismo
  if (establecimientoPadreId && parseInt(establecimientoPadreId) === parseInt(id)) {
    return res.status(400).json({ message: 'Un establecimiento no puede ser padre de sí mismo' });
  }
  
  try {
    const result = await actualizarEstablecimiento(id, nombre, establecimientoPadreId || null);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }
    res.json({ message: 'Establecimiento actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Ya existe un establecimiento con ese nombre' });
    }
    res.status(500).json({ message: 'Error al actualizar el establecimiento' });
  }
};

exports.eliminarEstablecimiento = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar que el establecimiento existe
    const establecimiento = await obtenerEstablecimientoPorId(id);
    if (!establecimiento) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }
    
    // Eliminar el establecimiento
    const result = await eliminarEstablecimiento(id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }
    
    res.json({ message: 'Establecimiento eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.message.includes('dependientes')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('usuarios asociados')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('archivos REM asociados')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error al eliminar el establecimiento' });
  }
};
