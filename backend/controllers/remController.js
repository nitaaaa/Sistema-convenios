const XLSX = require('xlsx');
const path = require('path');
const { guardarArchivoRem, registrarRem, getRemByRuta } = require('../models/remModel');
const {buscarEstablecimientoPorNombreYComuna } = require('../models/establecimientoModel');
const { getFormulaIdsValidasPorFecha, getFormulaById, guardarResultadoCalculo } = require('../models/formulaCalculoModel');
const { buscarComunaPorNombre } = require('../models/comunaModel');
const fs = require('fs');

// Función para convertir nombre de mes a número
function mesANumero(mes) {
  const meses = {
    'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04',
    'MAYO': '05', 'JUNIO': '06', 'JULIO': '07', 'AGOSTO': '08',
    'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12'
  };
  return meses[mes.toUpperCase()] || '01';
}

exports.subirExcel = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ mensaje: 'No se recibieron archivos.' });
  }
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
      // Buscar comuna en la base de datos
      const comunaBD = await buscarComunaPorNombre(nombreComuna);
      if (!comunaBD) {
        archivosNoGuardados.push({ archivo: file.originalname, motivo: `La comuna '${nombreComuna}' no existe en la base de datos` });
        continue;
      }
      // Buscar establecimiento en la base de datos
      const establecimientoBD = await buscarEstablecimientoPorNombreYComuna(nombreEstablecimiento, comunaBD.id);
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
      // Guardar el archivo usando el modelo
      const nombreArchivoSinExtension = path.basename(file.originalname, path.extname(file.originalname));
      const filePath = path.join(ruta, nombreArchivoSinExtension + '-' + nombreMes + '-' + nombreAnio + path.extname(file.originalname));
      guardarArchivoRem(filePath, file.buffer);
      // Registrar en la tabla rem
      await registrarRem(filePath, establecimientoBD.id);
      // Guardar el archivo en archivosGuardados con su buffer y ruta
      archivosGuardados.push({ 
        nombre: file.originalname, 
        buffer: file.buffer,
        ruta: filePath 
      });
    } catch (error) {
      let motivo = 'Error al procesar: ' + error.message;
      if (error.message && error.message.includes('Duplicate entry')) {
        motivo = 'Archivo ya existe en la base de datos';
      }
      archivosNoGuardados.push({ archivo: file.originalname, motivo });
    }
  }

  if (archivosNoGuardados.length > 0) {
    res.status(207).json({
      archivosNoGuardados,
      archivosGuardados: archivosGuardados.map(a => a.nombre)
    });
  } else {
    res.status(200).json({ mensaje: 'Archivos subidos y procesados correctamente.', archivosGuardados: archivosGuardados.map(a => a.nombre) });
  }

  // Procesamiento en segundo plano: buscar fórmulas de cálculo válidas para cada archivo guardado
  setImmediate(async () => {
    for (const archivo of archivosGuardados) {
      try {
        const workbook = XLSX.read(archivo.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets['NOMBRE'];
        if (!sheet) {
          console.warn(`No existe la hoja NOMBRE en el archivo: ${archivo.nombre}`);
          continue;
        }
        const mesCell = XLSX.utils.encode_cell({ r: 5, c: 1 }); // B6
        const anioCell = XLSX.utils.encode_cell({ r: 6, c: 1 }); // B7
        const nombreMes = sheet[mesCell]?.v;
        const nombreAnio = sheet[anioCell]?.v;
        if (!nombreMes || !nombreAnio) {
          console.warn(`No se pudo extraer mes y año de la hoja NOMBRE en el archivo: ${archivo.nombre}`);
          continue;
        }
        // Construir fecha: primer día del mes
        const fecha = `${nombreAnio}-${mesANumero(nombreMes)}-01`;
        try {
          // Obtener fórmulas válidas para esta fecha
          const formulas = await getFormulaIdsValidasPorFecha(fecha);

          // Obtener el ID del REM usando la ruta
          const rem = await getRemByRuta(archivo.ruta);
          if (!rem) {
            console.warn(`[${archivo.nombre}] No se encontró el REM en la base de datos para la ruta: ${archivo.ruta}`);
            continue;
          }
          
          const remId = rem.id;

          // Para cada fórmula válida
          for (const formulaId of formulas) {
            try {
              
              
              // Obtener la fórmula
              const formula = await getFormulaById(formulaId);
              if (!formula) {
                console.warn(`[${archivo.nombre}] No se encontró la fórmula con ID: ${formulaId}`);
                continue;
              }
              

              // Leer la hoja correspondiente
              const formulaSheet = workbook.Sheets[formula.fuente];
              if (!formulaSheet) {
                console.warn(`[${archivo.nombre}] No existe la hoja ${formula.fuente} en el archivo`);
                continue;
              }
              

              // Obtener los valores de las celdas del numerador
              const celdasNumerador = formula.numerador.split(',').map(celda => celda.trim());
              

              let sumaNumerador = 0;
              let valoresEncontrados = [];
              let celdasNoEncontradas = [];

              for (const celda of celdasNumerador) {
                const valorCelda = formulaSheet[celda]?.v;
                if (valorCelda === undefined) {
                  celdasNoEncontradas.push(celda);
                  continue;
                }
                valoresEncontrados.push({ celda, valor: valorCelda });
                sumaNumerador += valorCelda;
              }

              if (celdasNoEncontradas.length > 0) {
                console.warn(`[${archivo.nombre}] No se encontraron valores en las celdas: ${celdasNoEncontradas.join(', ')}`);
                continue;
              }

              

              // Calcular el resultado
              let resultado;
              if (formula.denominador === 0) {
                
                resultado = 0;
              } else {
                resultado = sumaNumerador / formula.denominador;
                
                
              }

              // Guardar el resultado en la base de datos
              await guardarResultadoCalculo(remId, formulaId, resultado);
              

            } catch (err) {
              console.error(`[${archivo.nombre}] Error al procesar la fórmula ${formulaId}:`, err.message);
            }
          }
        } catch (err) {
          console.error(`[${archivo.nombre}] Error al consultar fórmulas:`, err.message);
        }
      } catch (err) {
        console.error(`[${archivo.nombre}] Error procesando archivo:`, err.message);
      }
    }
  });
}; 