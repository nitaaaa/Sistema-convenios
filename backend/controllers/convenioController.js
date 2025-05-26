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
    // 1. Obtener convenio, componentes, indicadores y fórmulas
    const convenio = await require('../models/convenioModel').getConvenioPorId(convenioId);
    if (!convenio) {
      return res.status(404).json({ message: 'No se encontró el convenio' });
    }
    const fechaInicio = new Date(convenio.inicio);
    const fechaFin = new Date(convenio.termino);
    const mesInicio = fechaInicio.getMonth() + 1;
    const mesFin = fechaFin.getMonth() + 1;
    const mesesNombre = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const mesesValidos = [];
    for (let m = mesInicio; m <= mesFin; m++) {
      mesesValidos.push(mesesNombre[m - 1]);
    }
    const componentes = await getComponentesPorConvenio(convenioId);
    const componentesConIndicadores = await Promise.all(componentes.map(async (comp) => {
      const indicadores = await getIndicadoresPorComponente(comp.id);
      const indicadoresConFormulas = await Promise.all(indicadores.map(async (ind) => {
        const formulas = await getFormulasPorIndicador(ind.id);
        return { ...ind, formulas };
      }));
      return { ...comp, indicadores: indicadoresConFormulas };
    }));
    
    // 2. Buscar carpetas de meses válidos
    const basePath = path.join(__dirname, '..', 'REMs', 'PUERTO MONTT', establecimiento, anio);
    if (!fs.existsSync(basePath)) {
      return res.status(404).json({ message: 'No existe la ruta del año para el establecimiento' });
    }
    const meses = fs.readdirSync(basePath).filter(mes => fs.statSync(path.join(basePath, mes)).isDirectory() && mesesValidos.includes(mes));

    // Ordenar los meses según el orden natural
    meses.sort((a, b) => mesesNombre.indexOf(a) - mesesNombre.indexOf(b));
    const resultados = {};
    for (const mes of meses) {
      const mesPath = path.join(basePath, mes);
      const archivos = fs.readdirSync(mesPath).filter(f => f.endsWith('.xlsx') || f.endsWith('.xlsm'));
      if (archivos.length === 0) continue;
      const archivoExcel = path.join(mesPath, archivos[0]);
      const workbook = XLSX.readFile(archivoExcel);
      resultados[mes] = [];
      // 3. Calcular resultados para cada fórmula
      for (const comp of componentesConIndicadores) {
        for (const ind of comp.indicadores) {
          // Seleccionar la hoja según el campo fuente del indicador
          const sheetName = ind.fuente;
          const sheet = workbook.Sheets[sheetName];
          if (!sheet) continue;
          for (const formula of ind.formulas) {
            // Numerador: puede ser varias celdas separadas por coma
            const celdas = formula.numerador.split(',').map(c => c.trim());
            let sumaNumerador = 0;
            for (const celda of celdas) {
              const valor = sheet[celda]?.v;
              sumaNumerador += Number(valor) || 0;
            }
            const denominador = Number(formula.denominador);
            let resultado = denominador === 0 ? 0 : sumaNumerador / denominador;
            if (resultado > 1) resultado = 1;
            resultados[mes].push({
              componente: comp.nombre,
              indicador: ind.nombre,
              formula: formula.titulo,
              numerador: sumaNumerador,
              denominador,
              resultado
            });
          }
        }
      }
    }
    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al calcular los resultados de las fórmulas' });
  }
}

module.exports = { createConvenio, getConveniosPorAnio, componentesPorConvenio, indicadoresPorComponente, formulasPorIndicador, calcularResultadosPorMes }; 
