import { useState } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'

function CuotasForm({ cuotas, setCuotas, modo }) {
  const [nuevaCuota, setNuevaCuota] = useState({
    fechaRendicion: '',
    porcentajes: [{ valor: '', descuento: '' }]
  })
  const [erroresCuotas, setErroresCuotas] = useState({})

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
      isNaN(parseFloat(p.valor)) || isNaN(parseFloat(p.descuento)) ||
      parseFloat(p.valor) <= 0 || parseFloat(p.valor) > 100 ||
      parseFloat(p.descuento) < 0 || parseFloat(p.descuento) > 100
    )

    if (porcentajesInvalidos) {
      setErroresCuotas(prev => ({
        ...prev,
        porcentajes: 'Todos los porcentajes y descuentos deben ser valores válidos entre 0 y 100'
      }))
      return
    }

    setCuotas(prev => ([...prev, { ...nuevaCuota }]))
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
    setCuotas(prev => {
      const nuevosCuotas = [...prev]
      nuevosCuotas[index][field] = value
      return nuevosCuotas
    })
  }

  const handlePorcentajeCuotaChange = (index, i, field, value) => {
    setCuotas(prev => {
      const nuevosCuotas = [...prev]
      const nuevosPorcentajes = [...nuevosCuotas[index].porcentajes]
      nuevosPorcentajes[i][field] = value
      nuevosCuotas[index].porcentajes = nuevosPorcentajes
      return nuevosCuotas
    })
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
                step="0.01"
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
                step="0.01"
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

      <Button variant="primary" onClick={handleAddCuota}>
        Agregar Cuota
      </Button>

      {cuotas.map((cuota, index) => (
        <div key={index} className="mb-3 p-3 border rounded border-black">
          <h5>Cuota {index + 1}</h5>
          <Form.Group className="mb-2">
            <Form.Label>Fecha de Rendición</Form.Label>
            {modo === "modificar" ? (
              <Form.Control
                type="date"
                value={cuota.fechaRendicion}
                onChange={e => handleCuotaChange(index, 'fechaRendicion', e.target.value)}
              />
            ) : (
              <p><strong>{cuota.fechaRendicion}</strong></p>
            )}
          </Form.Group>
          <h6>Porcentajes de Cumplimiento:</h6>
          {cuota.porcentajes.map((p, i) => (
            <div key={i} className="mb-2">
              {modo === "modificar" ? (
                <Row>
                  <Col md={5}>
                    <Form.Control
                      type="number"
                      value={p.valor}
                      onChange={e => handlePorcentajeCuotaChange(index, i, 'valor', e.target.value)}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </Col>
                  <Col md={5}>
                    <Form.Control
                      type="number"
                      value={p.descuento}
                      onChange={e => handlePorcentajeCuotaChange(index, i, 'descuento', e.target.value)}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </Col>
                </Row>
              ) : (
                <p>
                  Cumplimiento: {p.valor}% - Descuento: {p.descuento}%
                </p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default CuotasForm 