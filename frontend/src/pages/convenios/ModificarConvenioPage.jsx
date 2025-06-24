import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Spinner } from 'react-bootstrap'
import ConvenioForm from '../../components/ConvenioForm'
import { obtenerConvenioPorId, actualizarConvenio, obtenerConveniosPorAnio } from '../../services/convenioService'

function ModificarConvenioPage() {
  const navigate = useNavigate()
  const [anio, setAnio] = useState('')
  const [convenioSeleccionado, setConvenioSeleccionado] = useState('')
  const [convenios, setConvenios] = useState([])
  const [formData, setFormData] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

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
          setConvenioSeleccionado(''); // Limpiar selección anterior
        })
        .catch(() => setConvenios([]));
    } else {
      setConvenios([]);
      setConvenioSeleccionado('');
    }
  }, [anio]);

  // Cargar datos del convenio cuando se selecciona uno
  useEffect(() => {
    const fetchConvenio = async () => {
      if (!convenioSeleccionado) {
        setFormData(null);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const convenio = await obtenerConvenioPorId(convenioSeleccionado)
        if (!convenio) {
          setError('No se encontró el convenio solicitado.')
        } else {
          setFormData({
            ...convenio,
            componentes: convenio.componentes || [],
            cuotas: convenio.cuotas || []
          })
        }
      } catch (err) {
        setError('Error al cargar el convenio')
      } finally {
        setLoading(false)
      }
    }
    fetchConvenio()
  }, [convenioSeleccionado])

  const handleSubmit = async (data) => {
    setError('')
    setSuccess('')
    try {
      await actualizarConvenio(convenioSeleccionado, data)
      setSuccess('Convenio modificado exitosamente')
      setTimeout(() => {
        navigate('/convenios')
      }, 2000)
    } catch (err) {
      setError('Error al modificar el convenio')
    }
  }

  return (
    <div className="container mt-4">
      <h2>Modificar Convenio</h2>
      
      {/* Selectores de año y convenio */}
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">Año</label>
          <select 
            className="form-select" 
            value={anio} 
            onChange={e => setAnio(e.target.value)}
          >
            <option value="">Seleccione año</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Convenio</label>
          <select 
            className="form-select" 
            value={convenioSeleccionado} 
            onChange={e => setConvenioSeleccionado(e.target.value)}
            disabled={!anio || convenios.length === 0}
          >
            <option value="">Seleccione convenio</option>
            {convenios.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicador de carga */}
      {loading && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <Spinner animation="border" />
        </div>
      )}

      {/* Mensajes de error y éxito */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Formulario de modificación */}
      {formData && !loading && (
        <ConvenioForm
          initialData={formData}
          onSubmit={handleSubmit}
          modo="modificar"
        />
      )}
    </div>
  )
}

export default ModificarConvenioPage 