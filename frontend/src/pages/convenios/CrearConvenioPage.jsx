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
    componentes: []
  }

  const handleSubmit = async (formData) => {
    try {
      await crearConvenio(formData)
      window.alert('Convenio creado exitosamente')
      navigate('/convenios')
    } catch (error) {
      window.alert('Error al crear el convenio: ' + (error?.response?.data?.message || error.message))
    }
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Crear Nuevo Convenio</h2>
      
      <ConvenioForm 
        initialData={initialData}
        onSubmit={handleSubmit}
        modo="crear"
      />
    </div>
  )
}

export default CrearConvenioPage 