const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { listarEstablecimientos, listarComunas, listarEstablecimientosPorComuna } = require('../models/establecimientoModel');

exports.subirExcel = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ mensaje: 'No se recibieron archivos.' });
  }

  const archivosNoGuardados = [];
  const archivosGuardados = [];

  req.files.forEach(file => {
    try {
      // Leer el archivo Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets['NOMBRE'];
      if (!sheet) {
        archivosNoGuardados.push({ archivo: file.originalname, motivo: 'No existe la hoja NOMBRE' });
        return;
      }
      // Extraer datos importantes
      const comuna = XLSX.utils.encode_cell({ r: 1, c: 1 }); // B2
      const establecimiento = XLSX.utils.encode_cell({ r: 2, c: 1 }); // B3
      const mes = XLSX.utils.encode_cell({ r: 5, c: 1 }); // B6
      const anio = XLSX.utils.encode_cell({ r: 6, c: 1 }); // B7
      const nombreComuna = sheet[comuna]?.v;
      const nombreEstablecimiento = sheet[establecimiento]?.v;
      const nombreMes = sheet[mes]?.v;
      const nombreAnio = sheet[anio]?.v;
      if (!nombreComuna || !nombreEstablecimiento || !nombreMes || !nombreAnio) {
        archivosNoGuardados.push({ archivo: file.originalname, motivo: 'Faltan datos en B2, B3, B5 o B6' });
        return;
      }
      const baseDir = path.join(__dirname, '..', 'REMs');
      const ruta = path.join(
        baseDir,
        nombreComuna,
        nombreEstablecimiento,
        String(nombreAnio),
        String(nombreMes)
      );
      // Crear carpetas si no existen
      fs.mkdirSync(ruta, { recursive: true });
      // Guardar el archivo
      const filePath = path.join(ruta, file.originalname);
      fs.writeFileSync(filePath, file.buffer);
      archivosGuardados.push(file.originalname);
    } catch (error) {
      archivosNoGuardados.push({ archivo: file.originalname, motivo: 'Error al procesar: ' + error.message });
    }
  });

  if (archivosNoGuardados.length > 0) {
    return res.status(207).json({
      mensaje: 'Algunos archivos no fueron guardados.',
      archivosNoGuardados,
      archivosGuardados
    });
  }
  res.status(200).json({ mensaje: 'Archivos subidos y procesados correctamente.', archivosGuardados });
};

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
