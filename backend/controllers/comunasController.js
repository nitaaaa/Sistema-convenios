const { listarComunas, buscarComunaPorNombre } = require('../models/comunaModel');

exports.getComunas = async (req, res) => {
  try {
    const comunas = await listarComunas();
    res.json(comunas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener comunas' });
  }
};

exports.getComunaPorNombre = async (req, res) => {
  const { nombre } = req.params;
  try {
    const comuna = await buscarComunaPorNombre(nombre);
    if (!comuna) {
      return res.status(404).json({ message: 'Comuna no encontrada' });
    }
    res.json(comuna);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la comuna por nombre' });
  }
}; 