const fs = require('fs');
const path = require('path');
const { listarComunas } = require('./comunaModel');
const { listarEstablecimientosPorComuna } = require('./establecimientoModel');
const db = require('../config/database');

async function getComunas() {
  return await listarComunas();
}

async function getEstablecimientosPorComuna(comunaId) {
  return await listarEstablecimientosPorComuna(comunaId);
}

function guardarArchivoRem(ruta, buffer) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, buffer);
}

// Función para convertir nombre de mes a número
function mesANumero(mes) {
  const meses = {
    'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04',
    'MAYO': '05', 'JUNIO': '06', 'JULIO': '07', 'AGOSTO': '08',
    'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12'
  };
  return meses[mes.toUpperCase()] || '01';
}

async function registrarRem(ruta, establecimientoId) {
  // Extraer mes y año de la ruta
  // Normalizar la ruta para usar forward slashes
  const rutaNormalizada = ruta.replace(/\\/g, '/');
  const rutaParts = rutaNormalizada.split('/');
  const anio = rutaParts[rutaParts.length - 3]; // El año está en el penúltimo segmento
  const mesNombre = rutaParts[rutaParts.length - 2].split('.')[0]; // El mes está en el último segmento, sin la extensión
  const mes = mesANumero(mesNombre);

  // Validar que mes y año existan
  if (!mes || !anio) {
    throw new Error('No se pudo extraer el mes o año de la ruta');
  }

  const [result] = await db.execute(
    'INSERT INTO rem (ruta, Establecimientos_id, mes, ano) VALUES (?, ?, ?, ?)',
    [ruta, establecimientoId, mes, anio]
  );
  return result;
}

async function getRemByRuta(ruta) {
  const [rem] = await db.execute('SELECT id FROM rem WHERE ruta = ?', [ruta]);
  return rem[0];
}

module.exports = {
  getComunas,
  getEstablecimientosPorComuna,
  guardarArchivoRem,
  registrarRem,
  getRemByRuta
}; 