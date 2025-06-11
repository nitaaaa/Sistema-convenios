import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const GraficoTotales = ({ indicadores, totalesPorIndicador, sumaTotal }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;


    // Calcular el máximo valor para ajustar la escala
    const maxValue = Math.max(...indicadores.map(ind => totalesPorIndicador[ind]));
    const maxScale = Math.ceil(maxValue * 100) / 100;

    const option = {
      tooltip: {},
      grid: {
        left: '15%',
        right: '5%',
        bottom: '20%',
        top: '15%',
        containLabel: true
      },
      graphic: [{
        type: 'text',
        right: '5%',
        top: '5%',
        style: {
          text: `Suma Total: ${sumaTotal}%`,
          font: 'bold 14px Arial',
          fill: '#333'
        }
      }],
      xAxis: {
        type: 'category',
        data: indicadores,
        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 11,
          margin: 15,
          width: 100,
          overflow: 'truncate'
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        axisLabel: {
          fontSize: 11,
          formatter: '{value}%'
        },
        min: 0,
        max: maxScale,
        interval: maxScale / 5,
        splitNumber: 5
      },
      series: [
        {
          name: 'Total',
          type: 'bar',
          data: indicadores.map(ind => ({
            value: totalesPorIndicador[ind],
            
          })),
          barWidth: '60%'
        }
      ]
    };

    const instance = echarts.init(chartRef.current);
    instance.setOption(option);

    return () => {
      instance.dispose();
    };
  }, [indicadores, totalesPorIndicador, sumaTotal]);

  return (
    <div style={{ height: 400, marginBottom: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 16 }}>
      <h5 style={{ marginBottom: 16 }}>Totales por Indicador</h5>
      <div ref={chartRef} style={{ width: '100%', height: 320 }} />
    </div>
  );
};

export default GraficoTotales; 