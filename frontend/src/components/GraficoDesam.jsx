import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function GraficoDesam({ resultados, indicadores, meses }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !resultados) return;

    // Crear un objeto para almacenar los colores de los indicadores
    const coloresIndicadores = {};
    const coloresBase = [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
      '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b3bd'
    ];
    indicadores.forEach((indicador, index) => {
      coloresIndicadores[indicador] = coloresBase[index % coloresBase.length];
    });

    const option = {
      title: {
        text: 'Resultados DESAM',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
          params.forEach(param => {
            const color = param.color;
            const value = param.value.toFixed(2);
            result += `<div style="display: flex; align-items: center; margin: 3px 0;">
                        <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; margin-right: 5px;"></span>
                        <span>${param.seriesName}: ${value}%</span>
                      </div>`;
          });
          return result;
        }
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
        data: indicadores
      },
      grid: {
        left: '3%',
        right: '15%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: meses,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: indicadores.map(indicador => ({
        name: indicador,
        type: 'bar',
        stack: 'total',
        data: meses.map((mes, indexMes) => {
          let total = 0;
          // Calcular el acumulado hasta el mes actual
          for (let i = 0; i <= indexMes; i++) {
            const mesActual = meses[i];
            Object.values(resultados).forEach(establecimiento => {
              if (establecimiento && establecimiento[mesActual]) {
                const formulas = establecimiento[mesActual].filter(f => f.indicador === indicador);
                if (formulas.length > 0) {
                  const promedio = formulas.reduce((acc, f) => acc + (typeof f.resultado === 'number' ? f.resultado : 0), 0) / formulas.length;
                  const peso = formulas[0].peso_final || 0;
                  total += promedio * peso 
                }
              }
            });
          }
          return Number(total.toFixed(2));
        }),
        itemStyle: {
          color: coloresIndicadores[indicador]
        }
      }))
    };

    const chart = echarts.init(chartRef.current);
    chart.setOption(option);

    // Manejar redimensionamiento
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [resultados, indicadores, meses]);

  return (
    <div style={{ height: 600, marginBottom: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 16 }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default GraficoDesam; 