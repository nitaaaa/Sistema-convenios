const db = require('../config/database');
const { getFormulaIdsByConvenio, getFormulaIdsAplicadasPorRem, getFormulaIdsValidasPorFecha } = require('../models/formulaCalculoModel');
const { getAllRems } = require('../models/remModel');

// Función para obtener fórmulas no aplicadas por convenio
async function obtenerFormulasNoAplicadasPorConvenio(req, res) {
  const { convenioId } = req.params;
  
  if (!convenioId) {
    return res.status(400).json({ message: 'Falta el parámetro convenioId' });
  }

  try {
    // 1. Obtener todos los REMs
    const rems = await getAllRems();
    
    // 2. Obtener todas las fórmulas asociadas al convenio
    const formulaIds = await getFormulaIdsByConvenio(convenioId);
    
    if (formulaIds.length === 0) {
      return res.json({ 
        message: 'No hay fórmulas asociadas a este convenio',
        formulasNoAplicadas: [] 
      });
    }

    // 3. Para cada REM, verificar qué fórmulas faltan
    const resultado = [];
    
    for (const rem of rems) {
      // Obtener fórmulas ya aplicadas a este REM
      const aplicadasIds = await getFormulaIdsAplicadasPorRem(rem.id);
      
      // Calcular fórmulas faltantes
      const faltantes = formulaIds.filter(fid => !aplicadasIds.includes(fid));
      
      if (faltantes.length > 0) {
        resultado.push({ 
          rem_id: rem.id, 
          ruta: rem.ruta,
          formulas_faltantes: faltantes,
          total_formulas_convenio: formulaIds.length,
          formulas_aplicadas: aplicadasIds.length,
          formulas_pendientes: faltantes.length
        });
      }
    }

    res.json({
      convenioId: parseInt(convenioId),
      total_rems: rems.length,
      total_formulas_convenio: formulaIds.length,
      rems_con_formulas_pendientes: resultado.length,
      formulasNoAplicadas: resultado
    });

  } catch (error) {
    console.error('Error al obtener fórmulas no aplicadas:', error);
    res.status(500).json({ message: 'Error al obtener las fórmulas no aplicadas' });
  }
}

// Función para obtener fórmulas no aplicadas por fecha
async function obtenerFormulasNoAplicadasPorFecha(req, res) {
  const { fecha } = req.params;
  
  if (!fecha) {
    return res.status(400).json({ message: 'Falta el parámetro fecha' });
  }

  try {
    // 1. Obtener todos los REMs
    const rems = await getAllRems();
    
    // 2. Obtener fórmulas válidas para la fecha especificada
    const formulaIds = await getFormulaIdsValidasPorFecha(fecha);
    
    if (formulaIds.length === 0) {
      return res.json({ 
        message: 'No hay fórmulas válidas para la fecha especificada',
        formulasNoAplicadas: [] 
      });
    }

    // 3. Para cada REM, verificar qué fórmulas faltan
    const resultado = [];
    
    for (const rem of rems) {
      // Obtener fórmulas ya aplicadas a este REM
      const aplicadasIds = await getFormulaIdsAplicadasPorRem(rem.id);
      
      // Calcular fórmulas faltantes
      const faltantes = formulaIds.filter(fid => !aplicadasIds.includes(fid));
      
      if (faltantes.length > 0) {
        resultado.push({ 
          rem_id: rem.id, 
          ruta: rem.ruta,
          formulas_faltantes: faltantes,
          total_formulas_fecha: formulaIds.length,
          formulas_aplicadas: aplicadasIds.length,
          formulas_pendientes: faltantes.length
        });
      }
    }

    res.json({
      fecha,
      total_rems: rems.length,
      total_formulas_fecha: formulaIds.length,
      rems_con_formulas_pendientes: resultado.length,
      formulasNoAplicadas: resultado
    });

  } catch (error) {
    console.error('Error al obtener fórmulas no aplicadas por fecha:', error);
    res.status(500).json({ message: 'Error al obtener las fórmulas no aplicadas por fecha' });
  }
}

// Función para obtener resumen general de fórmulas no aplicadas
async function obtenerResumenFormulasNoAplicadas(req, res) {
  try {
    // Consulta SQL para obtener un resumen completo
    const [resultado] = await db.execute(`
      SELECT 
        fc.id as formula_id,
        fc.titulo as formula_titulo,
        fc.numerador,
        fc.denominador,
        i.nombre as indicador_nombre,
        c.nombre as componente_nombre,
        conv.nombre as convenio_nombre,
        conv.id as convenio_id,
        COUNT(DISTINCT r.id) as total_rems,
        COUNT(DISTINCT rc.rem_id) as rems_con_resultado,
        (COUNT(DISTINCT r.id) - COUNT(DISTINCT rc.rem_id)) as rems_sin_resultado
      FROM formula_calculo fc
      INNER JOIN indicadores i ON fc.Indicadores_id = i.id
      INNER JOIN componentes c ON i.Componentes_id = c.id
      INNER JOIN convenios conv ON c.Convenios_id = conv.id
      CROSS JOIN rem r
      LEFT JOIN resultados_calculo rc ON fc.id = rc.formula_calculo_id AND r.id = rc.rem_id
      GROUP BY fc.id, fc.titulo, fc.numerador, fc.denominador, i.nombre, c.nombre, conv.nombre, conv.id
      HAVING rems_sin_resultado > 0
      ORDER BY conv.nombre, c.nombre, i.nombre, fc.titulo
    `);

    // Agrupar por convenio para mejor organización
    const resumenPorConvenio = {};
    
    for (const row of resultado) {
      if (!resumenPorConvenio[row.convenio_id]) {
        resumenPorConvenio[row.convenio_id] = {
          convenio_id: row.convenio_id,
          convenio_nombre: row.convenio_nombre,
          total_formulas: 0,
          total_rems_sin_resultado: 0,
          formulas: []
        };
      }
      
      resumenPorConvenio[row.convenio_id].formulas.push({
        formula_id: row.formula_id,
        formula_titulo: row.formula_titulo,
        numerador: row.numerador,
        denominador: row.denominador,
        indicador_nombre: row.indicador_nombre,
        componente_nombre: row.componente_nombre,
        total_rems: row.total_rems,
        rems_con_resultado: row.rems_con_resultado,
        rems_sin_resultado: row.rems_sin_resultado
      });
      
      resumenPorConvenio[row.convenio_id].total_formulas++;
      resumenPorConvenio[row.convenio_id].total_rems_sin_resultado += row.rems_sin_resultado;
    }

    const resumenFinal = Object.values(resumenPorConvenio);

    res.json({
      total_convenios_con_pendientes: resumenFinal.length,
      resumen_por_convenio: resumenFinal
    });

  } catch (error) {
    console.error('Error al obtener resumen de fórmulas no aplicadas:', error);
    res.status(500).json({ message: 'Error al obtener el resumen de fórmulas no aplicadas' });
  }
}

// Función para obtener fórmulas no aplicadas de un REM específico
async function obtenerFormulasNoAplicadasPorRem(req, res) {
  const { remId } = req.params;
  
  if (!remId) {
    return res.status(400).json({ message: 'Falta el parámetro remId' });
  }

  try {
    // Consulta SQL para obtener todas las fórmulas que no están aplicadas a este REM específico
    const [resultado] = await db.execute(`
      SELECT 
        fc.id as formula_id,
        fc.titulo as formula_titulo,
        fc.numerador,
        fc.denominador,
        fc.fuente,
        i.nombre as indicador_nombre,
        i.peso_final,
        c.nombre as componente_nombre,
        conv.nombre as convenio_nombre,
        conv.id as convenio_id,
        conv.inicio as fecha_inicio_convenio,
        conv.termino as fecha_fin_convenio
      FROM formula_calculo fc
      INNER JOIN indicadores i ON fc.Indicadores_id = i.id
      INNER JOIN componentes c ON i.Componentes_id = c.id
      INNER JOIN convenios conv ON c.Convenios_id = conv.id
      WHERE fc.id NOT IN (
        SELECT DISTINCT formula_calculo_id 
        FROM resultados_calculo 
        WHERE rem_id = ?
      )
      ORDER BY conv.nombre, c.nombre, i.nombre, fc.titulo
    `, [remId]);

    // Obtener información del REM
    const [remInfo] = await db.execute(`
      SELECT id, ruta, establecimientos_id, fecha_creacion
      FROM rem 
      WHERE id = ?
    `, [remId]);

    if (remInfo.length === 0) {
      return res.status(404).json({ message: 'REM no encontrado' });
    }

    res.json({
      rem: remInfo[0],
      total_formulas_pendientes: resultado.length,
      formulas_pendientes: resultado
    });

  } catch (error) {
    console.error('Error al obtener fórmulas no aplicadas por REM:', error);
    res.status(500).json({ message: 'Error al obtener las fórmulas no aplicadas por REM' });
  }
}

module.exports = {
  obtenerFormulasNoAplicadasPorConvenio,
  obtenerFormulasNoAplicadasPorFecha,
  obtenerResumenFormulasNoAplicadas,
  obtenerFormulasNoAplicadasPorRem
}; 