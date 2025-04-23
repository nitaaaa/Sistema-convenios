import { useState } from 'react'
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap'
//import './CrearConvenioPage.css'

function CrearConvenioPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    monto: '',
    componentes: [],
    cuotas: []
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [erroresIndicadores, setErroresIndicadores] = useState({})
  const [erroresCuotas, setErroresCuotas] = useState({})

  const [nuevoComponente, setNuevoComponente] = useState({
    nombre: '',
    indicadores: []
  })

  const [nuevaCuota, setNuevaCuota] = useState({
    fechaRendicion: '',
    porcentajes: [{ valor: '', descuento: '' }]
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Aquí irá la lógica para crear el convenio
      console.log('Datos del convenio:', formData)
      setSuccess('Convenio creado exitosamente')
    } catch (error) {
      setError('Error al crear el convenio')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddComponente = () => {
    if (nuevoComponente.nombre.trim() === '') {
      setError('El nombre del componente no puede estar vacío')
      return
    }

    setFormData(prev => ({
      ...prev,
      componentes: [...prev.componentes, { 
        ...nuevoComponente,
        nuevoIndicador: {
          nombre: '',
          numerador: '',
          denominador: '',
          pesoFinal: '',
          fuente: ''
        }
      }]
    }))
    setNuevoComponente({
      nombre: '',
      indicadores: []
    })
  }

  const handleAddIndicador = (componenteIndex) => {
    const componente = formData.componentes[componenteIndex]
    const indicador = componente.nuevoIndicador

    // Limpiar el error anterior
    setErroresIndicadores(prev => ({
      ...prev,
      [componenteIndex]: ''
    }))

    if (indicador.nombre.trim() === '' || 
        indicador.numerador.trim() === '' || 
        indicador.denominador.trim() === '' || 
        indicador.pesoFinal.trim() === '' || 
        indicador.fuente.trim() === '') {
      setErroresIndicadores(prev => ({
        ...prev,
        [componenteIndex]: 'Todos los campos del indicador son requeridos'
      }))
      return
    }

    const pesoFinal = parseFloat(indicador.pesoFinal)
    if (isNaN(pesoFinal) || pesoFinal <= 0 || pesoFinal > 100) {
      setErroresIndicadores(prev => ({
        ...prev,
        [componenteIndex]: 'El peso final debe ser un número entre 0 y 100'
      }))
      return
    }

    setFormData(prev => {
      const nuevosComponentes = [...prev.componentes]
      const nuevoIndicador = { ...indicador }
      nuevosComponentes[componenteIndex] = {
        ...nuevosComponentes[componenteIndex],
        indicadores: [...nuevosComponentes[componenteIndex].indicadores, nuevoIndicador],
        nuevoIndicador: {
          nombre: '',
          numerador: '',
          denominador: '',
          pesoFinal: '',
          fuente: ''
        }
      }
      return {
        ...prev,
        componentes: nuevosComponentes
      }
    })
  }

  const handleIndicadorChange = (componenteIndex, field, value) => {
    setFormData(prev => {
      const nuevosComponentes = [...prev.componentes]
      nuevosComponentes[componenteIndex].nuevoIndicador[field] = value
      return {
        ...prev,
        componentes: nuevosComponentes
      }
    })
  }

  const handleAddCuota = () => {
    if (nuevaCuota.fechaRendicion === '') {
      setErroresCuotas(prev => ({
        ...prev,
        fecha: 'La fecha de rendición es requerida'
      }))
      return
    }

    // Validar que todos los porcentajes tengan valores válidos
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

    setFormData(prev => ({
      ...prev,
      cuotas: [...prev.cuotas, { ...nuevaCuota }]
    }))
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

  return (
    <Container className="convenio-container">
      <h2>Crear Nuevo Convenio</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit} className="convenio-form">
        <Form.Group className="mb-3">
          <Form.Label>Nombre del Convenio</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Fin</Form.Label>
              <Form.Control
                type="date"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Monto</Form.Label>
          <Form.Control
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </Form.Group>

        <div className="mb-4">
          <h4>Cuotas</h4>
          <div className="mb-3 p-3 border rounded">
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
          </div>

          {formData.cuotas.map((cuota, index) => (
            <div key={index} className="mb-3 p-3 border rounded">
              <h5>Cuota {index + 1}</h5>
              <p><strong>Fecha de Rendición:</strong> {cuota.fechaRendicion}</p>
              <h6>Porcentajes de Cumplimiento:</h6>
              {cuota.porcentajes.map((p, i) => (
                <div key={i} className="mb-2">
                  <p>
                    Cumplimiento: {p.valor}% - Descuento: {p.descuento}%
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h4>Componentes</h4>
          <div className="mb-3">
            <Row>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Nombre del componente"
                  value={nuevoComponente.nombre}
                  onChange={(e) => setNuevoComponente({ ...nuevoComponente, nombre: e.target.value })}
                />
              </Col>
              <Col xs="auto">
                <Button variant="primary" onClick={handleAddComponente}>
                  Agregar Componente
                </Button>
              </Col>
            </Row>
          </div>

          {formData.componentes.map((componente, componenteIndex) => (
            <div key={componenteIndex} className="mb-4 p-3 border rounded">
              <h5>Componente: {componente.nombre}</h5>
              
              <div className="mb-3">
                <h6>Indicadores</h6>
                <div className="mb-3">
                  <Row className="g-2">
                    <Col md={3}>
                      <Form.Control
                        type="text"
                        placeholder="Nombre del indicador"
                        value={componente.nuevoIndicador.nombre}
                        onChange={(e) => handleIndicadorChange(componenteIndex, 'nombre', e.target.value)}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="text"
                        placeholder="Numerador"
                        value={componente.nuevoIndicador.numerador}
                        onChange={(e) => handleIndicadorChange(componenteIndex, 'numerador', e.target.value)}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="text"
                        placeholder="Denominador"
                        value={componente.nuevoIndicador.denominador}
                        onChange={(e) => handleIndicadorChange(componenteIndex, 'denominador', e.target.value)}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        placeholder="Peso Final (%)"
                        value={componente.nuevoIndicador.pesoFinal}
                        onChange={(e) => handleIndicadorChange(componenteIndex, 'pesoFinal', e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="text"
                        placeholder="Fuente"
                        value={componente.nuevoIndicador.fuente}
                        onChange={(e) => handleIndicadorChange(componenteIndex, 'fuente', e.target.value)}
                      />
                    </Col>
                    <Col xs="auto">
                      <div className="d-flex flex-row align-items-center">
                        <Button 
                          variant="success" 
                          onClick={() => handleAddIndicador(componenteIndex)}
                        >
                          Agregar
                        </Button>
                        {erroresIndicadores[componenteIndex] && (
                          <small className="text-danger ms-2">
                            {erroresIndicadores[componenteIndex]}
                          </small>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>

                {componente.indicadores.map((indicador, indicadorIndex) => (
                  <div key={indicadorIndex} className="mb-2 p-2 border rounded">
                    <Row>
                      <Col md={3}><strong>Nombre:</strong> {indicador.nombre}</Col>
                      <Col md={2}><strong>Numerador:</strong> {indicador.numerador}</Col>
                      <Col md={2}><strong>Denominador:</strong> {indicador.denominador}</Col>
                      <Col md={2}><strong>Peso Final:</strong> {indicador.pesoFinal}%</Col>
                      <Col md={2}><strong>Fuente:</strong> {indicador.fuente}</Col>
                    </Row>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button variant="primary" type="submit">
          Crear Convenio
        </Button>
      </Form>
    </Container>
  )
}

export default CrearConvenioPage 