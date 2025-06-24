const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { listarEstablecimientos, listarEstablecimientosPorComuna, listarEstablecimientosDependientes, obtenerEstablecimientoPorId, buscarEstablecimientoPorNombreYComuna } = require('../models/establecimientoModel');

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
