const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { listarEstablecimientosPorComuna} = require('../models/establecimientoModel');
const { listarComunas } = require('../models/comunaModel');

exports.subirExcel = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ mensaje: 'No se recibieron archivos.' });
  }
  const comunas = await listarComunas();
  const archivosNoGuardados = [];
  const archivosGuardados = [];

  for (const file of req.files) {
    try {
      // Leer el archivo Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets['NOMBRE'];
      if (!sheet) {
        archivosNoGuardados.push({ archivo: file.originalname, motivo: 'No existe la hoja NOMBRE' });
        continue;
      }
      // Extraer datos importantes
      const comuna = XLSX.utils.encode_cell({ r: 1, c: 1 }); // B2
      const establecimiento = XLSX.utils.encode_cell({ r: 2, c: 1 }); // B3
      const mes = XLSX.utils.encode_cell({ r: 5, c: 1 }); // B6
      const anio = XLSX.utils.encode_cell({ r: 6, c: 1 }); // B7
      const nombreComuna = sheet[comuna]?.v.toUpperCase();
      const nombreEstablecimiento = sheet[establecimiento]?.v.toUpperCase();
      const nombreMes = sheet[mes]?.v.toUpperCase();
      const nombreAnio = sheet[anio]?.v;
      if (!nombreComuna || !nombreEstablecimiento || !nombreMes || !nombreAnio) {
        archivosNoGuardados.push({ archivo: file.originalname, motivo: 'Faltan datos en Comuna, Establecimiento, mes o año' });
        continue;
      }
      // Buscar comuna en el listado
      const comunaBD = comunas.find(c => c.nombre === nombreComuna);
      if (!comunaBD) {
        archivosNoGuardados.push({ archivo: file.originalname, motivo: `La comuna '${nombreComuna}' no existe en la base de datos` });
        continue;
      }
      // Buscar establecimientos de la comuna
      const establecimientosComuna = await listarEstablecimientosPorComuna(comunaBD.id);
      const establecimientoBD = establecimientosComuna.find(e => e.nombre === nombreEstablecimiento);
      if (!establecimientoBD) {
        archivosNoGuardados.push({ archivo: file.originalname, motivo: `El establecimiento '${nombreEstablecimiento}' no existe en la comuna '${nombreComuna}'` });
        continue;
      }
      // Construir la ruta destino
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
      const nombreArchivoSinExtension = path.basename(file.originalname, path.extname(file.originalname));
      const filePath = path.join(ruta, nombreArchivoSinExtension + "-" + nombreMes + "-" + nombreAnio + path.extname(file.originalname));
      fs.writeFileSync(filePath, file.buffer);
      archivosGuardados.push(file.originalname);
    } catch (error) {
      archivosNoGuardados.push({ archivo: file.originalname, motivo: 'Error al procesar: ' + error.message });
    }
  }

  if (archivosNoGuardados.length > 0) {
    return res.status(207).json({
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
