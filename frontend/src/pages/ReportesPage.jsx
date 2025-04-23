import { useState, useEffect } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import axios from 'axios'
import './ReportesPage.css'

function ReportesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [embedInfo, setEmbedInfo] = useState(null)

  useEffect(() => {
    const cargarInforme = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await axios.get('/api/powerbi/embed-info')
        console.log('Información de incrustación:', response.data)
        setEmbedInfo(response.data)
      } catch (error) {
        console.error('Error al cargar informe:', error)
        setError('Error al cargar el reporte. Por favor, verifica tu conexión e intenta nuevamente.')
      } finally {
        setLoading(false)
      }
    }

    cargarInforme()
  }, [])

  return (
    <div className="report-container">
      {error && (
        <Alert 
          variant="danger" 
          className="error-alert"
          onClose={() => setError(null)} 
          dismissible
        >
          {error}
        </Alert>
      )}
      {loading && (
        <div className="loading-container">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando reporte...</p>
        </div>
      )}
      {embedInfo && (
        <iframe
          src={embedInfo.embedUrl}
          className="report-iframe"
          style={{ display: loading ? 'none' : 'block' }}
          title="Power BI Report"
          allowFullScreen
        />
      )}
    </div>
  )
}

export default ReportesPage