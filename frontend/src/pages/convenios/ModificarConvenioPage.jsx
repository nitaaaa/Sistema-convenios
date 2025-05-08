import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Spinner } from 'react-bootstrap'
import ConvenioForm from '../../components/ConvenioForm'
import { obtenerConvenioPorId, actualizarConvenio } from '../../services/convenioService'

function ModificarConvenioPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConvenio = async () => {
      try {
        const convenio = await obtenerConvenioPorId(id)
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
  }, [id])

  const handleSubmit = async (data) => {
    setError('')
    setSuccess('')
    try {
      await actualizarConvenio(id, data)
      setSuccess('Convenio modificado exitosamente')
      setTimeout(() => {
        navigate('/convenios')
      }, 2000)
    } catch (err) {
      setError('Error al modificar el convenio')
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
        <Spinner animation="border" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">{error}</Alert>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <h2>Modificar Convenio</h2>
      {success && <Alert variant="success">{success}</Alert>}
      {formData && (
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