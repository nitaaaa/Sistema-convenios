import { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Table } from 'react-bootstrap'

function CuotasForm({ cuotas = [], setCuotas, modo }) {
  
  
  const [nuevaCuota, setNuevaCuota] = useState({
    fechaRendicion: '',
    porcentajes: [{ valor: '', descuento: '' }]
  })
  const [erroresCuotas, setErroresCuotas] = useState({})

  // Cargar datos existentes cuando esté en modo modificar
  useEffect(() => {
    if (modo === "modificar" && Array.isArray(cuotas) && cuotas.length > 0) {
      // Si hay cuotas existentes, no mostrar el formulario de nueva cuota
      setNuevaCuota({
        fechaRendicion: '',
        porcentajes: [{ valor: '', descuento: '' }]
      })
    }
  }, [modo, cuotas])

  // Función para convertir fecha ISO a formato YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      
      const formattedDate = date.toISOString().split('T')[0]
      return formattedDate
    } catch (error) {
      console.error('Error formateando fecha:', error)
      return ''
    }
  }

  // Función para convertir formato YYYY-MM-DD a ISO
  const formatDateForBackend = (dateString) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString + 'T00:00:00')
      const isoDate = date.toISOString()
      return isoDate
    } catch (error) {
      console.error('Error convirtiendo fecha para backend:', error)
      return ''
    }
  }

  const handleAddCuota = () => {
    if (nuevaCuota.fechaRendicion === '') {
      setErroresCuotas(prev => ({
        ...prev,
        fecha: 'La fecha de rendición es requerida'
      }))
      return
    }

    const porcentajesInvalidos = nuevaCuota.porcentajes.some(p =>
      p.valor === '' || p.descuento === '' ||
      isNaN(parseInt(p.valor)) || isNaN(parseInt(p.descuento)) ||
      parseInt(p.valor) <= 0 || parseInt(p.valor) > 100 ||
      parseInt(p.descuento) < 0 || parseInt(p.descuento) > 100
    )

    if (porcentajesInvalidos) {
      setErroresCuotas(prev => ({
        ...prev,
        porcentajes: 'Todos los porcentajes y descuentos deben ser valores válidos entre 0 y 100'
      }))
      return
    }

    // Convertir la fecha al formato ISO para el backend
    const cuotaParaAgregar = {
      ...nuevaCuota,
      fechaRendicion: formatDateForBackend(nuevaCuota.fechaRendicion)
    }

    // Obtener el valor actual de cuotas
    const cuotasActuales = Array.isArray(cuotas) ? cuotas : []
    const cuotasActualizadas = [...cuotasActuales]
    cuotasActualizadas.push(cuotaParaAgregar)
    setCuotas(cuotasActualizadas)

    setNuevaCuota({
      fechaRendicion: '',
      porcentajes: [{ valor: '', descuento: '' }]
    })
    setErroresCuotas({})
  }

  const handleAddPorcentaje = () => {
    setNuevaCuota(prev => ({
      ...prev,
      porcentajes: [...prev.porcentajes, { valor: '', descuento: '' }]
    }))
  }

  const handlePorcentajeChange = (index, field, value) => {
    setNuevaCuota(prev => {
      const nuevosPorcentajes = [...prev.porcentajes]
      nuevosPorcentajes[index][field] = value
      return {
        ...prev,
        porcentajes: nuevosPorcentajes
      }
    })
  }

  const handleCuotaChange = (index, field, value) => {
    
    // Obtener el valor actual de cuotas
    const cuotasActuales = Array.isArray(cuotas) ? cuotas : []
    const nuevosCuotas = [...cuotasActuales]
    
    // Si es la fecha, convertir al formato ISO
    if (field === 'fechaRendicion') {
      nuevosCuotas[index][field] = formatDateForBackend(value)
    } else {
      nuevosCuotas[index][field] = value
    }
    
    
    setCuotas(nuevosCuotas)
  }

  const handlePorcentajeCuotaChange = (index, i, field, value) => {
    
    // Obtener el valor actual de cuotas
    const cuotasActuales = Array.isArray(cuotas) ? cuotas : []
    const nuevosCuotas = [...cuotasActuales]
    
    if (nuevosCuotas[index] && nuevosCuotas[index].porcentajes) {
      const nuevosPorcentajes = [...nuevosCuotas[index].porcentajes]
      nuevosPorcentajes[i][field] = value
      nuevosCuotas[index].porcentajes = nuevosPorcentajes
    }
    
    
    setCuotas(nuevosCuotas)
  }

  const handleRemoveCuota = (index) => {
    
    // Obtener el valor actual de cuotas
    const cuotasActuales = Array.isArray(cuotas) ? cuotas : []
    const nuevasCuotas = [...cuotasActuales]
    nuevasCuotas.splice(index, 1)
    
    setCuotas(nuevasCuotas)
  }

  const handleRemovePorcentajeFromCuota = (cuotaIndex, porcentajeIndex) => {
    
    // Obtener el valor actual de cuotas
    const cuotasActuales = Array.isArray(cuotas) ? cuotas : []
    const nuevosCuotas = [...cuotasActuales]
    
    // Solo eliminar si hay más de un porcentaje
    if (nuevosCuotas[cuotaIndex] && nuevosCuotas[cuotaIndex].porcentajes && nuevosCuotas[cuotaIndex].porcentajes.length > 1) {
      nuevosCuotas[cuotaIndex].porcentajes.splice(porcentajeIndex, 1)
    }
    
    
    setCuotas(nuevosCuotas)
  }

  const handleAddPorcentajeToCuota = (cuotaIndex) => {
    
    // Obtener el valor actual de cuotas
    const cuotasActuales = Array.isArray(cuotas) ? cuotas : []
    const nuevosCuotas = [...cuotasActuales]
    
    if (nuevosCuotas[cuotaIndex]) {
      nuevosCuotas[cuotaIndex].porcentajes.push({ valor: '', descuento: '' })
    }
    
    
    setCuotas(nuevosCuotas)
  }

  return (
    <div className="seccion-container mb-3 p-3">
      <h4>Cuotas</h4>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Label>Fecha de Rendición</Form.Label>
          <Form.Control
            type="date"
            value={nuevaCuota.fechaRendicion}
            onChange={(e) => setNuevaCuota({ ...nuevaCuota, fechaRendicion: e.target.value })}
          />
          {erroresCuotas.fecha && (
            <small className="text-danger">{erroresCuotas.fecha}</small>
          )}
        </Col>
      </Row>

      <div className="mb-3">
        <h6>Porcentajes de Cumplimiento</h6>
        {nuevaCuota.porcentajes.map((porcentaje, index) => (
          <Row key={index} className="mb-2">
            <Col md={5}>
              <Form.Control
                type="number"
                placeholder="Porcentaje de cumplimiento"
                value={porcentaje.valor}
                onChange={(e) => handlePorcentajeChange(index, 'valor', e.target.value)}
                min="0"
                max="100"
                step="1"
              />
            </Col>
            <Col md={5}>
              <Form.Control
                type="number"
                placeholder="Descuento asociado (%)"
                value={porcentaje.descuento}
                onChange={(e) => handlePorcentajeChange(index, 'descuento', e.target.value)}
                min="0"
                max="100"
                step="1"
              />
            </Col>
            {index === nuevaCuota.porcentajes.length - 1 && (
              <Col xs="auto">
                <Button variant="outline-primary" onClick={handleAddPorcentaje}>
                  +
                </Button>
              </Col>
            )}
          </Row>
        ))}
        {erroresCuotas.porcentajes && (
          <small className="text-danger">{erroresCuotas.porcentajes}</small>
        )}
      </div>

      <Button variant="primary" onClick={handleAddCuota} className="mb-3">
        Agregar Cuota
      </Button>

      {Array.isArray(cuotas) && cuotas.length > 0 && (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha de Rendición</th>
                <th>Porcentajes de Cumplimiento</th>
                <th>Descuentos Asociados</th>
                {modo === "modificar" && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {cuotas.map((cuota, index) => {
                
                const maxPorcentajes = cuota.porcentajes ? cuota.porcentajes.length : 0
                return cuota.porcentajes ? cuota.porcentajes.map((p, i) => (
                  <tr key={`${index}-${i}`}>
                    {i === 0 && (
                      <td rowSpan={maxPorcentajes}>{index + 1}</td>
                    )}
                    {i === 0 && (
                      <td rowSpan={maxPorcentajes}>
                        {modo === "modificar" ? (
                          <Form.Control
                            type="date"
                            value={formatDateForInput(cuota.fechaRendicion)}
                            onChange={e => handleCuotaChange(index, 'fechaRendicion', e.target.value)}
                          />
                        ) : (
                          formatDateForInput(cuota.fechaRendicion)
                        )}
                      </td>
                    )}
                    <td>
                      {modo === "modificar" ? (
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            value={p.valor || ''}
                            onChange={e => handlePorcentajeCuotaChange(index, i, 'valor', e.target.value)}
                            min="0"
                            max="100"
                            step="1"
                            className="me-2"
                            style={{ width: '100px' }}
                          />
                          {cuota.porcentajes.length > 1 && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleRemovePorcentajeFromCuota(index, i)}
                              title="Eliminar porcentaje"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div>{p.valor}%</div>
                      )}
                    </td>
                    <td>
                      {modo === "modificar" ? (
                        <Form.Control
                          type="number"
                          value={p.descuento || ''}
                          onChange={e => handlePorcentajeCuotaChange(index, i, 'descuento', e.target.value)}
                          min="0"
                          max="100"
                          step="1"
                          style={{ width: '100px' }}
                        />
                      ) : (
                        <div>{p.descuento}%</div>
                      )}
                    </td>
                    {modo === "modificar" && i === 0 && (
                      <td rowSpan={maxPorcentajes}>
                        <div className="d-flex flex-column gap-2">
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleRemoveCuota(index)}
                            title="Eliminar cuota completa"
                          >
                            Eliminar Cuota
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => handleAddPorcentajeToCuota(index)}
                            title="Agregar porcentaje"
                          >
                            + Porcentaje
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                )) : null
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default CuotasForm 