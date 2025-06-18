import { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';

function GraficoDesam({ resultados, indicadores, meses, onPorcentajeAcumuladoChange }) {
  console.log('Renderizando GraficoDesam');
  
  const chartRef = useRef(null);
  const porcentajeAcumuladoRef = useRef([]);
  const callbackRef = useRef(onPorcentajeAcumuladoChange);
  const valoresAnterioresRef = useRef(null);

  // Actualizar el callback ref cuando cambia
  useEffect(() => {
    console.log('Efecto 1: Actualizando callbackRef');
    callbackRef.current = onPorcentajeAcumuladoChange;
  }, [onPorcentajeAcumuladoChange]);

  // Memoizamos la función de cálculo de los valores
  const calcularValores = useCallback(() => {
    console.log('Ejecutando calcularValores');
    if (!resultados) return { valoresBarras: [], porcentajeAcumulado: [] };

    // Primero calculamos los acumulados de cada indicador por mes
    const acumuladosPorMes = meses.map(mes => {
      const acumuladosIndicadores = {};
      indicadores.forEach(indicador => {
        let totalMes = 0;
        Object.values(resultados).forEach(establecimiento => {
          if (establecimiento && establecimiento[mes]) {
            const formulas = establecimiento[mes].filter(f => f.indicador === indicador);
            if (formulas.length > 0) {
              // Filtrar fórmulas que tienen denominador > 0
              const formulasValidas = formulas.filter(f => f.denominador > 0);
              
              // Solo calcular el promedio si hay fórmulas válidas
              if (formulasValidas.length > 0) {
                const promedio = formulasValidas.reduce((acc, f) => acc + (typeof f.resultado === 'number' ? f.resultado : 0), 0) / formulasValidas.length;
                const peso = formulasValidas[0].peso_final || 0;
                totalMes += promedio * peso;
              }
            }
          }
        });
        acumuladosIndicadores[indicador] = totalMes;
      });
      return acumuladosIndicadores;
    });

    // Calculamos los valores acumulados de las barras
    const valoresBarras = indicadores.map(indicador => {
      let acumulado = 0;
      const pesoFinal = Object.values(resultados)[0]?.[meses[0]]?.find(f => f.indicador === indicador)?.peso_final || 0;
      
      return meses.map((mes, indexMes) => {
        acumulado += acumuladosPorMes[indexMes][indicador];
        acumulado = Math.min(acumulado, pesoFinal);
        return Number(acumulado.toFixed(2));
      });
    });

    // Calculamos la línea usando los valores acumulados de las barras
    const porcentajeAcumulado = meses.map((mes, indexMes) => {
      const totalMes = valoresBarras.reduce((sum, barras) => sum + barras[indexMes], 0);
      return Number(totalMes.toFixed(2));
    });

    console.log('Valores calculados:', { valoresBarras, porcentajeAcumulado });
    return { valoresBarras, porcentajeAcumulado };
  }, [resultados, indicadores, meses]);

  useEffect(() => {
    console.log('Efecto 2: Iniciando efecto principal');
    if (!chartRef.current || !resultados) {
      console.log('Efecto 2: No hay resultados o chartRef');
      return;
    }

    // Crear un objeto para almacenar los colores de los indicadores
    const coloresIndicadores = {};
    const coloresBase = [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
      '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b3bd'
    ];
    indicadores.forEach((indicador, index) => {
      coloresIndicadores[indicador] = coloresBase[index % coloresBase.length];
    });

    // Calculamos los valores
    const { valoresBarras, porcentajeAcumulado } = calcularValores();
    

    // Solo actualizamos y notificamos si los valores han cambiado
    const valoresActuales = JSON.stringify(porcentajeAcumulado);
    if (valoresActuales !== valoresAnterioresRef.current) {
      
      valoresAnterioresRef.current = valoresActuales;
      porcentajeAcumuladoRef.current = porcentajeAcumulado;

      // Notificar el cambio en el porcentaje acumulado
      if (callbackRef.current && porcentajeAcumulado.length > 0) {
        console.log('Efecto 2: Notificando cambio en porcentaje acumulado');
        callbackRef.current(porcentajeAcumulado);
      }
    } else {
      console.log('Efecto 2: Valores no han cambiado, omitiendo actualización');
    }

    const option = {
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
          return params.map(param => {
            const color = param.color;
            return `<div style="display: flex; align-items: center; margin-bottom: 3px;">
                      <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; margin-right: 5px;"></span>
                      <span>${param.seriesName}: ${Number(param.value).toFixed(2)}%</span>
                    </div>`;
          }).join('');
        }
      },
      legend: { },
      xAxis: { 
        data: meses, 
        axisLabel: { rotate: 45 } 
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        // Primero las barras
        ...indicadores.map((indicador, index) => ({
          name: indicador,
          type: 'bar',
          data: valoresBarras[index],
          itemStyle: {
            color: coloresIndicadores[indicador]
          }
        })),
        // Luego la línea
        {
          name: 'Porcentaje Acumulado',
          type: 'line',
          yAxisIndex: 0,
          data: porcentajeAcumulado,
          itemStyle: {
            color: '#ffc107'
          },
          lineStyle: {
            width: 1.5
          },
          symbol: 'circle',
          symbolSize: 8
        }
      ]
    };

    const chart = echarts.init(chartRef.current);
    chart.setOption(option);

    // Manejar redimensionamiento
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      console.log('Efecto 2: Limpieza');
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [resultados, indicadores, meses, calcularValores]);

  return (
    <div style={{ height: 600, marginBottom: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 16 }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default GraficoDesam; 