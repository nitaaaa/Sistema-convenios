import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from 'react-bootstrap'
import ConvenioForm from '../../components/ConvenioForm'
import { crearConvenio } from '../../services/convenioService'

function CrearConvenioPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const initialData = {
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    monto: '',
    componentes: [],
    cuotas: []
  }

  const handleSubmit = async (formData) => {
    try {
      await crearConvenio(formData)
      setSuccess('Convenio creado exitosamente')
      setTimeout(() => {
        navigate('/convenios')
      }, 2000)
    } catch (error) {
      setError('Error al crear el convenio: ' + error.message)
    }
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Crear Nuevo Convenio</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <ConvenioForm 
        initialData={initialData}
        onSubmit={handleSubmit}
        modo="crear"
      />
    </div>
  )
}

export default CrearConvenioPage 