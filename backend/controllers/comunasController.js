const { listarComunas } = require('../models/comunaModel');

exports.getComunas = async (req, res) => {
  try {
    const comunas = await listarComunas();
    res.json(comunas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener comunas' });
  }
}; 