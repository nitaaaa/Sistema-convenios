import { useState, useEffect, useRef } from 'react'
import './ReportesPage.css'
import * as echarts from 'echarts';
import { obtenerConveniosPorAnio } from '../services/convenioService';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';

function ReportesPage() {
  // Estados para los filtros
  const [anio, setAnio] = useState('');
  const [convenio, setConvenio] = useState('');
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState('');
  const [convenios, setConvenios] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [resultadosPorMes, setResultadosPorMes] = useState(null);
  const [loadingResultados, setLoadingResultados] = useState(false);

  // Generar años desde 2024 hasta el año actual
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2024; y <= currentYear; y++) {
    years.push(y);
  }

  // Consultar convenios según el año seleccionado
  useEffect(() => {
    if (anio) {
      obtenerConveniosPorAnio(anio)
        .then(data => {
          console.log('Convenios: ', data);
          setConvenios(data);
          setConvenio(''); // Limpiar selección anterior
        })
        .catch(() => setConvenios([]));
    } else {
      setConvenios([]);
      setConvenio('');
    }
  }, [anio]);

  // Cargar establecimientos desde localStorage al montar el componente
  useEffect(() => {
    const userDataStr = localStorage.getItem('userData');
    let establecimientosArr = [];
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        establecimientosArr = Array.isArray(userData.establecimientos) ? userData.establecimientos : [];
      } catch {
        establecimientosArr = [];
      }
    }
    setEstablecimientos(establecimientosArr);
  }, []);

  // Consultar resultados por mes al seleccionar año, convenio y establecimiento
  useEffect(() => {
    const fetchResultados = async () => {
      if (!anio || !convenio || !establecimientoSeleccionado) {
        setResultadosPorMes(null);
        return;
      }
      setLoadingResultados(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`/api/convenios/reportes/calculo`, {
          params: { anio, establecimiento: establecimientoSeleccionado, convenioId: convenio },
          headers: { Authorization: `Bearer ${token}` }
        });
        setResultadosPorMes(response.data);
        //console.log('Resultados: ', response.data);
      } catch (err) {
        setResultadosPorMes(null);
      } finally {
        setLoadingResultados(false);
      }
    };
    fetchResultados();
  }, [anio, convenio, establecimientoSeleccionado]);

  useEffect(() => {
    if (!resultadosPorMes) return;
    // Preparar datos para el gráfico
    let option = {
      title: { text: 'Resultados por mes' },
      tooltip: {},
      xAxis: {
        data: [],
        axisLabel: {
          rotate: 90
        }
      },
      yAxis: {},
      series: []
    };
    // Usar los meses tal como llegan del backend
    const meses = Object.keys(resultadosPorMes);
    option.xAxis.data = meses;
    // Obtener todos los nombres de indicadores únicos presentes en los resultados
    const indicadoresSet = new Set();
    meses.forEach(mes => {
      resultadosPorMes[mes].forEach(f => indicadoresSet.add(f.indicador));
    });
    const indicadores = Array.from(indicadoresSet);
    // Para cada indicador, armar una serie con los resultados promediados y acumulados por mes
    option.series = indicadores.map(indicador => {
      let acumulado = 0;
      const data = meses.map(mes => {
        // Filtrar las fórmulas de ese indicador en ese mes
        const formulas = resultadosPorMes[mes].filter(f => f.indicador === indicador);
        // Sumar los resultados y dividir por la cantidad de fórmulas (promedio)
        let resultadoMes = 0;
        if (formulas.length > 0) {
          resultadoMes = formulas.reduce((acc, f) => acc + (typeof f.resultado === 'number' ? f.resultado : 0), 0) / formulas.length;
        }
        acumulado += resultadoMes;
        return acumulado;
      });
      return {
        name: indicador,
        type: 'bar',
        data
      };
    });
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      chartInstance.current.setOption(option);
    }
    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [resultadosPorMes]);

  return (
    <div className="report-container" style={{ display: 'flex', height: '100vh', padding: 0 }}>
      {/* Filtros a la izquierda */}
      <div style={{ width: '320px', background: '#f8f9fa', padding: '32px 24px', borderRight: '1px solid #ddd' }}>
        <h4>Filtros</h4>
        <div className="mb-3">
          <label className="form-label">Año</label>
          <select className="form-select" value={anio} onChange={e => setAnio(e.target.value)} disabled={loadingResultados}>
            <option value="">Seleccione año</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Convenio</label>
          <select className="form-select" value={convenio} onChange={e => setConvenio(e.target.value)} disabled={!anio || convenios.length === 0 || loadingResultados}>
            <option value="">Seleccione convenio</option>
            {convenios.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Establecimiento</label>
          <select
            className="form-select"
            value={establecimientoSeleccionado}
            onChange={e => setEstablecimientoSeleccionado(e.target.value)}
            disabled={loadingResultados}
          >
            <option value="">Seleccione establecimiento</option>
            {establecimientos.map((est, idx) => (
              <option key={idx} value={est}>{est}</option>
            ))}
          </select>
        </div>
        {loadingResultados && (
        <div className="mt-3" style={{ display: 'flex', alignItems: 'center' }}>
          <Spinner animation="border" role="status" size="sm">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <span className="ms-2">Cargando resultados...</span>
        </div>
        )}
      </div>
      
      {/* Gráfico a la derecha */}
      <div style={{ flex: 1, padding: '32px', background: '#f5f5f5' }}>
        <div id="main" ref={chartRef} style={{ height: '100%', minHeight: 400 }} />
      </div>
    </div>
  )
}

export default ReportesPage