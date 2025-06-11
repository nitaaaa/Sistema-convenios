const db = require('../config/database');
const { crearConvenio } = require('../models/convenioModel');
const { crearComponente, getComponentesPorConvenio } = require('../models/componenteModel');
const { crearIndicador, getIndicadoresPorComponente } = require('../models/indicadorModel');
const { crearFormulaCalculo, getFormulasPorIndicador } = require('../models/formulaCalculo');
const { getConveniosPorAnio: getConveniosPorAnioModel } = require('../models/convenioModel');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

function validarCeldaExcel(valor) {
  // Permitir una o varias celdas separadas por coma, cada una debe ser válida
  if (typeof valor !== 'string') return false;
  return valor.split(',').every(celda => /^[A-Z]{1,3}[1-9][0-9]{0,4}$/i.test(celda.trim()));
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
    //return res.status(400).json({ message: 'La fecha de inicio y fin deben ser del mismo año' });
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
    if (Array.isArray(componentes)) {
      for (const componente of componentes) {
        const compResult = await crearComponente({ nombre: componente.nombre, convenioId }, connection);
        const componenteId = compResult.insertId;
        if (Array.isArray(componente.indicadores)) {
          for (const indicador of componente.indicadores) {
            const indResult = await crearIndicador({
              nombre: indicador.nombre,
              pesoFinal: indicador.pesoFinal,
              fuente: indicador.fuente,
              componenteId
            }, connection);
            const indicadorId = indResult.insertId;
            if (Array.isArray(indicador.formulas)) {
              for (const formula of indicador.formulas) {
                const formulaResult = await crearFormulaCalculo({
                  titulo: formula.titulo,
                  numerador: formula.numerador,
                  denominador: formula.denominador,
                  indicadorId
                }, connection);
              }
            }
          }
        }
      }
    }
    await connection.commit();

    //aqui cuando se ingresen los datos se deberá revisar si existen archivos que no se le han aplicado las formulas

    res.status(201).json({ message: 'Convenio, componentes, indicadores y fórmulas de cálculo creados exitosamente', convenioId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error al crear el convenio' });
  } finally {
    connection.release();
  }
}

// Obtener convenios por año
async function getConveniosPorAnio(req, res) {
  const { anio } = req.params;
  try {
    const rows = await getConveniosPorAnioModel(anio);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los convenios del año especificado' });
  }
}

// Obtener componentes por convenio
async function componentesPorConvenio(req, res) {
  const { convenioId } = req.params;
  try {
    const componentes = await getComponentesPorConvenio(convenioId);
    res.json(componentes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los componentes del convenio' });
  }
}

// Obtener indicadores por componente
async function indicadoresPorComponente(req, res) {
  const { componenteId } = req.params;
  try {
    const indicadores = await getIndicadoresPorComponente(componenteId);
    res.json(indicadores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los indicadores del componente' });
  }
}

// Obtener fórmulas de cálculo por indicador
async function formulasPorIndicador(req, res) {
  const { indicadorId } = req.params;
  try {
    const formulas = await getFormulasPorIndicador(indicadorId);
    res.json(formulas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las fórmulas de cálculo del indicador' });
  }
}

// Calcular resultados de fórmulas por mes
async function calcularResultadosPorMes(req, res) {
  const { anio, establecimiento, convenioId } = req.query;
  if (!anio || !establecimiento || !convenioId) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos (anio, establecimiento, convenioId)' });
  }
  try {
    // 1. Obtener convenio y sus fechas
    const convenio = await require('../models/convenioModel').getConvenioPorId(convenioId);
    if (!convenio) {
      return res.status(404).json({ message: 'No se encontró el convenio' });
    }

    // 2. Obtener todas las fórmulas asociadas al convenio
    const formulaIds = await require('../models/formulaCalculoModel').getFormulaIdsByConvenio(convenioId);
    if (!formulaIds || formulaIds.length === 0) {
      return res.status(404).json({ message: 'No se encontraron fórmulas asociadas al convenio' });
    }

    // 3. Obtener los resultados de las fórmulas desde la tabla resultados_calculo
    const placeholders = formulaIds.map(() => '?').join(',');
    const [resultados] = await db.execute(`
      SELECT 
        rc.formula_calculo_id,
        rc.resultado,
        r.ruta,
        r.mes,
        r.ano,
        fc.numerador,
        fc.denominador,
        i.nombre as indicador_nombre,
        i.fuente,
        c.nombre as componente_nombre,
        i.peso_final
      FROM resultados_calculo rc
      INNER JOIN rem r ON rc.rem_id = r.id
      INNER JOIN formula_calculo fc ON rc.formula_calculo_id = fc.id
      INNER JOIN indicadores i ON fc.Indicadores_id = i.id
      INNER JOIN componentes c ON i.Componentes_id = c.id
      WHERE rc.formula_calculo_id IN (${placeholders})
      AND r.ano = ?
      AND SUBSTRING_INDEX(SUBSTRING_INDEX(REPLACE(r.ruta, '\\\\', '/'), '/', -4), '/', 1) = ?
      ORDER BY r.mes
    `, [...formulaIds, anio, establecimiento]);

    // 4. Organizar los resultados por mes
    const resultadosPorMes = {};
    const mesesNombre = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

    for (const resultado of resultados) {
      const mes = mesesNombre[parseInt(resultado.mes) - 1];
      if (!resultadosPorMes[mes]) {
        resultadosPorMes[mes] = [];
      }
      resultadosPorMes[mes].push({
        componente: resultado.componente_nombre,
        indicador: resultado.indicador_nombre,
        formula_id: resultado.formula_calculo_id,
        numerador: resultado.numerador,
        denominador: resultado.denominador,
        resultado: resultado.resultado,
        peso_final: resultado.peso_final
      });
    }

    // 5. Ordenar los meses según el orden natural
    const mesesOrdenados = Object.keys(resultadosPorMes).sort((a, b) => 
      mesesNombre.indexOf(a) - mesesNombre.indexOf(b)
    );

    const resultadosFinales = {};
    for (const mes of mesesOrdenados) {
      resultadosFinales[mes] = resultadosPorMes[mes];
    }

    res.json(resultadosFinales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al calcular los resultados de las fórmulas' });
  }
}

module.exports = { createConvenio, getConveniosPorAnio, componentesPorConvenio, indicadoresPorComponente, formulasPorIndicador, calcularResultadosPorMes }; 
