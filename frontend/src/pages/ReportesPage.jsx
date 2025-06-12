import { useState, useEffect } from 'react'
import './ReportesPage.css'
import { obtenerConveniosPorAnio } from '../services/convenioService';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import { obtenerEstablecimientoPorId } from '../services/establecimientoService';
import { obtenerResultadosPorMes } from '../services/convenioService';
import GraficoTotales from '../components/GraficoTotales';
import GraficoEstablecimiento from '../components/GraficoEstablecimiento';
import GraficoDesam from '../components/GraficoDesam';
import TablaPrestaciones from '../components/TablaPrestaciones';
import { ordenMeses } from '../../constans';

function ReportesPage() {
  // Estados para los filtros y datos de la página
  const [anio, setAnio] = useState('');
  const [convenio, setConvenio] = useState('');
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState('');
  const [convenios, setConvenios] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [resultadosPorEstablecimiento, setResultadosPorEstablecimiento] = useState(null);
  const [loadingResultados, setLoadingResultados] = useState(false);

  // Generar array de años desde 2024 hasta el año actual para el selector
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2024; y <= currentYear; y++) {
    years.push(y);
  }

  // Consultar convenios disponibles según el año seleccionado
  useEffect(() => {
    if (anio) {
      obtenerConveniosPorAnio(anio)
        .then(data => {
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
  // Obtiene los establecimientos asociados al usuario actual
  useEffect(() => {
    const userDataStr = localStorage.getItem('userData');
    const establecimientosArr = [];
    const fetchEstablecimientos = async (ids) => {
      for (const id of ids) {
        try {
          const data = await obtenerEstablecimientoPorId(id);
          establecimientosArr.push({ id: data.id, nombre: data.nombre });
        } catch {}
      }
      setEstablecimientos(establecimientosArr);
    };
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const ids = Array.isArray(userData.establecimientos) ? userData.establecimientos : [];
        if (ids.length > 0) {
          fetchEstablecimientos(ids);
        } else {
          setEstablecimientos([]);
        }
      } catch {
        setEstablecimientos([]);
      }
    } else {
      setEstablecimientos([]);
    }
  }, []);

  // Consultar resultados por mes al seleccionar año, convenio y establecimiento
  // Devuelve un objeto con el establecimiento seleccionado y sus dependientes
  // Para cada establecimiento, devuelve un objeto con los meses y dentro de los meses devuelve los datos por componente, indicador y formula
  useEffect(() => {
    const fetchResultados = async () => {
      if (!anio || !convenio || !establecimientoSeleccionado) {
        setResultadosPorEstablecimiento(null);
        return;
      }
      setLoadingResultados(true);
      console.time('consulta-resultados'); // INICIO MEDICIÓN
      try {
        const token = localStorage.getItem('authToken');
        let todosEstablecimientos = [];

        if (establecimientoSeleccionado === 'DESAM') {
          // Si es DESAM, usar todos los establecimientos disponibles
          todosEstablecimientos = establecimientos.map(est => ({
            id: est.id,
            nombre: est.nombre
          }));
        } else {
          // 1. Buscar dependientes del establecimiento seleccionado
          const dependientesResp = await axios.get(`/api/establecimientos/dependientes/${establecimientoSeleccionado}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Armar lista de establecimientos a consultar (el principal + dependientes)
          const dependientes = dependientesResp.data;
          todosEstablecimientos = [
            { 
              id: establecimientoSeleccionado, 
              nombre: establecimientos.find(e => String(e.id) === String(establecimientoSeleccionado))?.nombre || establecimientoSeleccionado 
            },
            ...dependientes.map(dep => ({ id: dep.id, nombre: dep.nombre }))
          ];
        }

        // 2. Consultar resultados por cada establecimiento
        const resultados = {};
        for (const est of todosEstablecimientos) {
          try {
            const resp = await obtenerResultadosPorMes({ anio, establecimiento: est.nombre, convenioId: convenio});
            resultados[est.nombre] = resp;
          } catch {
            resultados[est.nombre] = null;
          }
        }
        setResultadosPorEstablecimiento(resultados);
      } catch (err) {
        setResultadosPorEstablecimiento(null);
      } finally {
        setLoadingResultados(false);
        console.timeEnd('consulta-resultados'); // FIN MEDICIÓN
      }
    };
    fetchResultados();
  }, [anio, convenio, establecimientoSeleccionado, establecimientos]);

  // Calcular datos para los gráficos
  // Procesa los resultados y genera los datos necesarios para renderizar los gráficos
  const calcularDatosGraficos = () => {
    if (!resultadosPorEstablecimiento) return null;

    // Obtener todos los meses presentes en todos los establecimientos
    const mesesSet = new Set();
    Object.values(resultadosPorEstablecimiento).forEach(res => {
      if (res) Object.keys(res).forEach(mes => mesesSet.add(mes));
    });
    const meses = Array.from(mesesSet).sort(
      (a, b) => ordenMeses.indexOf(a.toUpperCase()) - ordenMeses.indexOf(b.toUpperCase())
    );

    // Obtener todos los indicadores presentes en todos los establecimientos
    const indicadoresSet = new Set();
    Object.values(resultadosPorEstablecimiento).forEach(res => {
      if (res) Object.values(res).forEach(arr => arr.forEach(f => indicadoresSet.add(f.indicador)));
    });
    const indicadores = Array.from(indicadoresSet);

    // Calcular totales por indicador
    // Para cada indicador, suma los resultados ponderados de todos los establecimientos
    const totalesPorIndicador = {};
    let sumaTotal = 0;
    indicadores.forEach(indicador => {
      let total = 0;
      Object.values(resultadosPorEstablecimiento).forEach(res => {
        if (res) {
          Object.values(res).forEach(arr => {
            const formulas = arr.filter(f => f.indicador === indicador);
            
            if (formulas.length > 0) {
              const promedio = formulas.reduce((acc, f) => acc + (f.resultado || 0), 0) / formulas.length;
              const peso = formulas[0].peso_final || 0;
              const calculo = peso * promedio; // Convertir a decimal
              total = Math.max(total, calculo);
              console.log('total: ', total);
              console.log('es un numero? ', typeof total === 'number');
            }
          });
        }
      });
      // Convertimos a número después de redondear a 2 decimales
      totalesPorIndicador[indicador] = Number(Math.round(total * 100) / 100);
      sumaTotal += totalesPorIndicador[indicador];
    });
    // Redondeamos la suma total a 2 decimales
    sumaTotal = Number(Math.round(sumaTotal * 100) / 100);

    return {
      meses,
      indicadores,
      totalesPorIndicador,
      sumaTotal
    };
  };

  const datosGraficos = calcularDatosGraficos();

  return (
    <div className="report-container" style={{ display: 'flex', height: '100vh', padding: 0 }}>
      {/* Panel de filtros a la izquierda */}
      <div style={{ width: '320px', background: '#f8f9fa', padding: '32px 24px', borderRight: '1px solid #ddd' }}>
        <h4>Filtros</h4>
        {/* Selector de año */}
        <div className="mb-3">
          <label className="form-label">Año</label>
          <select className="form-select" value={anio} onChange={e => setAnio(e.target.value)} disabled={loadingResultados}>
            <option value="">Seleccione año</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        {/* Selector de convenio */}
        <div className="mb-3">
          <label className="form-label">Convenio</label>
          <select className="form-select" value={convenio} onChange={e => setConvenio(e.target.value)} disabled={!anio || convenios.length === 0 || loadingResultados}>
            <option value="">Seleccione convenio</option>
            {convenios.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        {/* Selector de establecimiento */}
        <div className="mb-3">
          <label className="form-label">Establecimiento</label>
          <select
            className="form-select"
            value={establecimientoSeleccionado}
            onChange={e => setEstablecimientoSeleccionado(e.target.value)}
            disabled={loadingResultados}
          >
            <option value="">Seleccione establecimiento</option>
            <option value="DESAM">DESAM (Todos los Establecimientos)</option>
            {establecimientos.map((est) => (
              <option key={est.id} value={est.id}>{est.nombre}</option>
            ))}
          </select>
        </div>
        {/* Indicador de carga */}
        {loadingResultados && (
          <div className="mt-3" style={{ display: 'flex', alignItems: 'center' }}>
            <Spinner animation="border" role="status" size="sm">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <span className="ms-2">Cargando resultados...</span>
          </div>
        )}
      </div>

      {/* Panel de gráficos a la derecha */}
      <div style={{ flex: 1, padding: '32px', background: '#f5f5f5', overflowY: 'auto', maxHeight: '100vh', marginTop: '56px' }}>
        {/* Gráfico DESAM o gráficos individuales por establecimiento */}
        {datosGraficos && (
          establecimientoSeleccionado === 'DESAM' ? (
            <GraficoDesam
              resultados={resultadosPorEstablecimiento}
              indicadores={datosGraficos.indicadores}
              meses={datosGraficos.meses}
            />
          ) : (
            Object.keys(resultadosPorEstablecimiento || {})
              .filter(nombreEst => nombreEst && resultadosPorEstablecimiento[nombreEst])
              .map(nombreEst => (
                <GraficoEstablecimiento
                  key={nombreEst}
                  nombreEst={nombreEst}
                  resultados={resultadosPorEstablecimiento[nombreEst]}
                  indicadores={datosGraficos.indicadores}
                  meses={datosGraficos.meses}
                />
            ))
          )
        )}

        {/* Gráfico de totales y tabla de prestaciones - solo visible cuando hay datos */}
        {datosGraficos && (
          <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{ flex: 1 }}>
              <GraficoTotales
                indicadores={datosGraficos.indicadores}
                totalesPorIndicador={datosGraficos.totalesPorIndicador}
                sumaTotal={datosGraficos.sumaTotal}
              />
            </div>
            <div style={{ flex: 1 }}>
              <TablaPrestaciones
                resultados={resultadosPorEstablecimiento}
                indicadores={datosGraficos.indicadores}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportesPage