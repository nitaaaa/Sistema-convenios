const db = require('../config/database');
const { crearConvenio } = require('../models/convenioModel');
const { crearComponente } = require('../models/componenteModel');
const { crearIndicador } = require('../models/indicadorModel');
const { crearFormulaCalculo } = require('../models/numeradorModel');

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

  // Validación: Fecha de inicio menor a fecha de fin
  if (new Date(fechaInicio) >= new Date(fechaFin)) {
    return res.status(400).json({ message: 'La fecha de inicio debe ser menor a la fecha de fin' });
  }

  // Validación 5: Monto entero
  if (!Number.isInteger(Number(monto))) {
    return res.status(400).json({ message: 'El monto debe ser un valor entero' });
  }

  // Validaciones de componentes, indicadores y fórmulas
  let celdasUsadas = new Set();
  let sumaPesosTotal = 0; // Nueva variable para la suma total de pesos

  // Validación: Debe existir al menos un componente
  if (!Array.isArray(componentes) || componentes.length === 0) {
    return res.status(400).json({ message: 'Debe existir al menos un componente.' });
  }

  if (Array.isArray(componentes)) {
    for (const componente of componentes) {
      
      // Validación: Cada componente debe tener al menos un indicador
      if (!Array.isArray(componente.indicadores) || componente.indicadores.length === 0) {
        return res.status(400).json({ message: `El componente '${componente.nombre}' debe tener al menos un indicador.` });
      }
      if (Array.isArray(componente.indicadores)) {
        for (const indicador of componente.indicadores) {
          sumaPesosTotal += Number(indicador.pesoFinal); // Sumar todos los pesos

          // Validación: Cada indicador debe tener al menos una fórmula de cálculo
          if (!Array.isArray(indicador.formulas) || indicador.formulas.length === 0) {
            return res.status(400).json({ message: `El indicador '${indicador.nombre}' debe tener al menos una fórmula de cálculo.` });
          }
          
          // Validación 2 y 3: Fórmulas
          if (Array.isArray(indicador.formulas)) {
            for (const formula of indicador.formulas) {
              if (!validarCeldaExcel(formula.numerador)) {
                return res.status(400).json({ message: `El numerador '${formula.numerador}' no es una celda de Excel válida.` });
              }
              if (!Number.isInteger(Number(formula.denominador))) {
                return res.status(400).json({ message: `El denominador de la fórmula '${formula.titulo}' debe ser un valor entero.` });
              }
              const celda = formula.numerador.toUpperCase();
              if (celdasUsadas.has(celda)) {
                return res.status(400).json({ message: `La celda '${celda}' ya fue utilizada en otra fórmula de cálculo.` });
              }
              celdasUsadas.add(celda);
            }
          }
        }
      }
    }
    // Validación: La suma total de los pesos debe ser 100
    if (sumaPesosTotal !== 100) {
      return res.status(400).json({ message: `La suma de los pesos finales de todos los indicadores debe ser 100.` });
    }
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await crearConvenio({ nombre, descripcion, fechaInicio, fechaFin, monto }, connection);
    const convenioId = result.insertId;
    console.log('Convenio insertado, ID:', convenioId);
    if (Array.isArray(componentes)) {
      for (const componente of componentes) {
        const compResult = await crearComponente({ nombre: componente.nombre, convenioId }, connection);
        const componenteId = compResult.insertId;
        console.log('Componente insertado, ID:', componenteId);
        if (Array.isArray(componente.indicadores)) {
          for (const indicador of componente.indicadores) {
            const indResult = await crearIndicador({
              nombre: indicador.nombre,
              pesoFinal: indicador.pesoFinal,
              fuente: indicador.fuente,
              componenteId
            }, connection);
            const indicadorId = indResult.insertId;
            console.log('Indicador insertado, ID:', indicadorId);
            if (Array.isArray(indicador.formulas)) {
              for (const formula of indicador.formulas) {
                const formulaResult = await crearFormulaCalculo({
                  titulo: formula.titulo,
                  numerador: formula.numerador,
                  denominador: formula.denominador,
                  indicadorId
                }, connection);
                console.log('Fórmula de cálculo insertada, ID:', formulaResult.insertId);
              }
            }
          }
        }
      }
    }
    await connection.commit();
    res.status(201).json({ message: 'Convenio, componentes, indicadores y fórmulas de cálculo creados exitosamente', convenioId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error al crear el convenio' });
  } finally {
    connection.release();
  }
}

module.exports = { createConvenio }; 
