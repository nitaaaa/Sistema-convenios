import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const GraficoEstablecimiento = ({ nombreEst, resultados, indicadores, meses }) => {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!chartRef.current || !resultados) return;

    

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
      series: []
    };

    indicadores.forEach(indicador => {
      let acumulado = 0;
      const data = meses.map(mes => {
        const formulas = resultados[mes]?.filter(f => f.indicador === indicador) || [];
        if (formulas.length > 0) {
          const promedio = formulas.reduce((acc, f) => acc + (typeof f.resultado === 'number' ? f.resultado : 0), 0) / formulas.length;
          const peso = formulas[0].peso_final || 0;
          let resultadoMes = 0;
          
          resultadoMes = peso * promedio ;
          
          acumulado += resultadoMes;
          return Number(acumulado.toFixed(2));
        }
        return Number(acumulado.toFixed(2));
      });
      option.series.push({
        name: indicador,
        type: 'bar',
        stack: 'total',
        data
      });
    });

    const instance = echarts.init(chartRef.current);
    instance.setOption(option);

    return () => {
      instance.dispose();
    };
  }, [nombreEst, resultados, indicadores, meses]);

  return (
    <div style={{ height: 400, marginBottom: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 16 }}>
      <h5 style={{ marginBottom: 16 }}>{nombreEst}</h5>
      <div ref={chartRef} style={{ width: '100%', height: 320 }} />
    </div>
  );
};

export default GraficoEstablecimiento; 