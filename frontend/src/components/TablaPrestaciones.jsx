import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
//import { getPrestacionesPorConvenio } from '../services/prestacionService';
import { ordenarMeses } from '../utils/dateUtils';

/**
 * Componente que muestra una tabla con las prestaciones realizadas y comprometidas por fórmula
 * @param {Object} resultados - Objeto que contiene los resultados por establecimiento y mes
 * @param {Array} indicadores - Lista de indicadores a mostrar en la tabla
 */
function TablaPrestaciones({ resultados, indicadores }) {
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);

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
                denominador: formula.denominador,
                detalleMensual: {}
              };
            }
            
            // Acumulamos las prestaciones realizadas (resultado * denominador)
            if (typeof formula.resultado === 'number' && !isNaN(formula.resultado)) {
              const prestacionesMes = formula.resultado * formula.denominador;
              prestacionesPorFormula[titulo].realizadas += prestacionesMes;
              
              // Guardamos el detalle mensual
              if (!prestacionesPorFormula[titulo].detalleMensual[mes]) {
                prestacionesPorFormula[titulo].detalleMensual[mes] = 0;
              }
              prestacionesPorFormula[titulo].detalleMensual[mes] += prestacionesMes;
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

  const handleMouseEnter = (event, formula) => {
    setTooltipData(formula);
    // La posición inicial se ajustará en el siguiente render cuando el tooltip exista
  };

  const handleMouseMove = (event) => {
    if (tooltipData && tooltipRef.current) {
      const tooltipHeight = tooltipRef.current.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;
      const mouseY = event.clientY;
      
      const y = mouseY + tooltipHeight > windowHeight 
        ? mouseY - tooltipHeight - 10 
        : mouseY + 10;

      setTooltipPosition({
        x: event.clientX + 10,
        y: y
      });
    }
  };

  // Efecto para ajustar la posición inicial del tooltip
  useEffect(() => {
    if (tooltipData && tooltipRef.current) {
      const tooltipHeight = tooltipRef.current.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;
      const mouseY = tooltipPosition.y;
      
      const y = mouseY + tooltipHeight > windowHeight 
        ? mouseY - tooltipHeight - 10 
        : mouseY + 10;

      setTooltipPosition(prev => ({
        ...prev,
        y: y
      }));
    }
  }, [tooltipData]);

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  return (
    <div 
      style={{ 
        background: '#fff', 
        borderRadius: 8, 
        boxShadow: '0 2px 8px #0001', 
        padding: 16,
        marginBottom: 32,
        position: 'relative'
      }}
      onMouseMove={handleMouseMove}
    >
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
                  <td 
                    onMouseEnter={(e) => handleMouseEnter(e, formula)}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: 'pointer' }}
                  >
                    {formula.titulo}
                  </td>
                  {/* Mostramos las prestaciones realizadas con formato de miles */}
                  <td className="text-end">{Math.round(formula.realizadas).toLocaleString()}</td>
                  {/* Mostramos el denominador (prestaciones comprometidas) con formato de miles o "No tributa" */}
                  <td className="text-end">
                    {formula.denominador === 0 ? "No tributa" : Math.round(formula.denominador).toLocaleString()}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {tooltipData && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            background: 'white',
            padding: '12px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '200px',
            pointerEvents: 'none'
          }}
        >
          <h6 style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
            {tooltipData.titulo}
          </h6>
          <div style={{ fontSize: '0.9em' }}>
            {ordenarMeses(Object.entries(tooltipData.detalleMensual))
              .map(([mes, cantidad]) => (
                <div key={mes} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{mes}:</span>
                  <span>{Math.round(cantidad).toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TablaPrestaciones; 