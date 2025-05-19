const db = require('../config/database');
const { crearConvenio } = require('../models/convenioModel');
const { crearComponente } = require('../models/componenteModel');
const { crearIndicador } = require('../models/indicadorModel');
const { crearNumerador } = require('../models/numeradorModel');

function validarCeldaExcel(valor) {
  // Expresion regular para validar que el input sea una celda de Excel valida
  // Ejemplo: A1, B2, AA10, Z100, etc.
  return /^[A-Z]{1,3}[1-9][0-9]{0,4}$/i.test(valor);
}

async function createConvenio(req, res) {
  const { nombre, descripcion, fechaInicio, fechaFin, monto, componentes } = req.body;
  if (!nombre || !fechaInicio || !fechaFin || !monto) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  // Validación 4: Fechas en el mismo año
  const anioInicio = new Date(fechaInicio).getFullYear();
  const anioFin = new Date(fechaFin).getFullYear();
  if (anioInicio !== anioFin) {
    return res.status(400).json({ message: 'La fecha de inicio y fin deben ser del mismo año' });
  }

  // Validación 5: Monto entero
  if (!Number.isInteger(Number(monto))) {
    return res.status(400).json({ message: 'El monto debe ser un valor entero' });
  }

  // Validaciones de componentes, indicadores y numeradores
  let celdasUsadas = new Set();
  if (Array.isArray(componentes)) {
    for (const componente of componentes) {
      // Validación 1: Suma de pesos
      let sumaPesos = 0;
      if (Array.isArray(componente.indicadores)) {
        for (const indicador of componente.indicadores) {
          sumaPesos += Number(indicador.pesoFinal);
          // Validación 2 y 3: Numeradores
          if (Array.isArray(indicador.numeradores)) {
            for (const numerador of indicador.numeradores) {
              if (!validarCeldaExcel(numerador.valor)) {
                return res.status(400).json({ message: `El valor del numerador '${numerador.valor}' no es una celda de Excel válida.` });
              }
              const celda = numerador.valor.toUpperCase();
              if (celdasUsadas.has(celda)) {
                return res.status(400).json({ message: `La celda '${celda}' ya fue utilizada en otro numerador.` });
              }
              celdasUsadas.add(celda);
            }
          }
        }
        if (sumaPesos !== 100) {
          return res.status(400).json({ message: `La suma de los pesos finales de los indicadores del componente '${componente.nombre}' debe ser 100.` });
        }
      }
    }
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await crearConvenio({ nombre, descripcion, fechaInicio, fechaFin, monto }, connection);
    const convenioId = result.insertId;
    if (Array.isArray(componentes)) {
      for (const componente of componentes) {
        const compResult = await crearComponente({ nombre: componente.nombre, convenioId }, connection);
        const componenteId = compResult.insertId;
        if (Array.isArray(componente.indicadores)) {
          for (const indicador of componente.indicadores) {
            const indResult = await crearIndicador({
              nombre: indicador.nombre,
              denominador: indicador.denominador,
              pesoFinal: indicador.pesoFinal,
              fuente: indicador.fuente,
              componenteId
            }, connection);
            const indicadorId = indResult.insertId;
            if (Array.isArray(indicador.numeradores)) {
              for (const numerador of indicador.numeradores) {
                await crearNumerador({
                  titulo: numerador.titulo,
                  numerador: numerador.valor,
                  indicadorId
                }, connection);
              }
            }
          }
        }
      }
    }
    await connection.commit();
    res.status(201).json({ message: 'Convenio, componentes, indicadores y numeradores creados exitosamente', convenioId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error al crear el convenio' });
  } finally {
    connection.release();
  }
}

module.exports = { createConvenio }; 
