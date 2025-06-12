import React from 'react';

/**
 * Componente que muestra una tabla con las prestaciones realizadas y comprometidas por fórmula
 * @param {Object} resultados - Objeto que contiene los resultados por establecimiento y mes
 * @param {Array} indicadores - Lista de indicadores a mostrar en la tabla
 */
function TablaPrestaciones({ resultados, indicadores }) {
  /**
   * Calcula las prestaciones realizadas y comprometidas por fórmula
   * @returns {Object} Objeto con las prestaciones por fórmula
   */
  const calcularPrestaciones = () => {
    // Objeto que almacenará las prestaciones por fórmula
    const prestacionesPorFormula = {};
    
    
    // Recorremos todos los establecimientos
    Object.entries(resultados).forEach(([establecimiento, meses]) => {
      
      if (meses) {
        // Recorremos todos los meses del establecimiento
        Object.entries(meses).forEach(([mes, formulas]) => {
          
          // Procesamos cada fórmula
          formulas.forEach(formula => {
            
            const titulo = formula.titulo || 'Sin título';
            const indicador = formula.indicador;
            
            // Inicializamos el objeto para esta fórmula si no existe
            if (!prestacionesPorFormula[titulo]) {
              prestacionesPorFormula[titulo] = {
                indicador,
                realizadas: 0,
                denominador: formula.denominador
              };
            }
            
            // Acumulamos las prestaciones realizadas (resultado * denominador)
            if (typeof formula.resultado === 'number' && !isNaN(formula.resultado)) {
              prestacionesPorFormula[titulo].realizadas += formula.resultado * formula.denominador;
            }
          });
        });
      }
    });

    return prestacionesPorFormula;
  };

  // Calculamos las prestaciones
  const prestaciones = calcularPrestaciones();

  // Agrupamos las fórmulas por indicador para la visualización
  const formulasPorIndicador = {};
  Object.entries(prestaciones).forEach(([titulo, data]) => {
    if (!formulasPorIndicador[data.indicador]) {
      formulasPorIndicador[data.indicador] = [];
    }
    formulasPorIndicador[data.indicador].push({ titulo, ...data });
  });

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: 8, 
      boxShadow: '0 2px 8px #0001', 
      padding: 16,
      marginBottom: 32
    }}>
      <h4 style={{ marginBottom: 16 }}>Prestaciones por Indicador</h4>
      <div style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Fórmula</th>
              <th className="text-end">Prestaciones Realizadas</th>
              <th className="text-end">Prestaciones Comprometidas</th>
            </tr>
          </thead>
          <tbody>
            {/* Generamos filas para cada indicador y sus fórmulas */}
            {indicadores.map(indicador => {
              const formulas = formulasPorIndicador[indicador] || [];
              
              return formulas.map((formula, index) => (
                <tr key={`${indicador}-${formula.titulo}`}>
                  {/* Mostramos el indicador solo en la primera fila de cada grupo */}
                  {index === 0 && (
                    <td rowSpan={formulas.length} style={{ verticalAlign: 'middle' }}>
                      {indicador}
                    </td>
                  )}
                  <td>{formula.titulo}</td>
                  {/* Mostramos las prestaciones realizadas con formato de miles */}
                  <td className="text-end">{Math.round(formula.realizadas).toLocaleString()}</td>
                  {/* Mostramos el denominador (prestaciones comprometidas) con formato de miles */}
                  <td className="text-end">{Math.round(formula.denominador).toLocaleString()}</td>
                </tr>
              ));
            })}
          </tbody>
          <tfoot>
            <tr className="table-secondary">
              <td colSpan="2"><strong>Totales</strong></td>
              {/* Calculamos y mostramos el total de prestaciones realizadas */}
              <td className="text-end">
                <strong>
                  {Math.round(
                    Object.values(prestaciones).reduce((sum, f) => sum + f.realizadas, 0)
                  ).toLocaleString()}
                </strong>
              </td>
              {/* Calculamos y mostramos el total de prestaciones comprometidas */}
              <td className="text-end">
                <strong>
                  {Math.round(
                    Object.values(prestaciones).reduce((sum, f) => sum + f.denominador, 0)
                  ).toLocaleString()}
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default TablaPrestaciones; 