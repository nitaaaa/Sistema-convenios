import { useState } from 'react'
import { Form, Button, Alert, Row, Col } from 'react-bootstrap'
import './ConvenioForm.css'

function ConvenioForm({ initialData, onSubmit, modo}) {
  const [formData, setFormData] = useState(initialData)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [erroresIndicadores, setErroresIndicadores] = useState({})

  const indicadorVacio = {
    nombre: '',
    numeradores: [],
    denominador: '',
    pesoFinal: '',
    fuente: ''
  }

  const [nuevoComponente, setNuevoComponente] = useState({
    nombre: '',
    indicadores: [],
    nuevoIndicador: { ...indicadorVacio }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await onSubmit(formData)
      setSuccess(modo === "crear" ? "Convenio creado exitosamente" : "Convenio modificado exitosamente")
    } catch (error) {
      setError('Error al ' + (modo === "crear" ? "crear" : "modificar") + ' el convenio')
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
        ...nuevoComponente
      }]
    }))
    setNuevoComponente({
      nombre: '',
      indicadores: [],
      nuevoIndicador: { ...indicadorVacio }
    })
  }

  const handleAddIndicador = (componenteIndex) => {
    console.log('handleAddIndicador iniciando con:', componenteIndex)
    const componente = formData.componentes[componenteIndex]
    const indicador = componente.nuevoIndicador

    setErroresIndicadores(prev => ({
      ...prev,
      [componenteIndex]: ''
    }))

    if (indicador.nombre.trim() === '' || 
        !indicador.numeradores?.length ||
        indicador.denominador.trim() === '' || 
        indicador.pesoFinal.trim() === '' || 
        indicador.fuente.trim() === '') {
      setErroresIndicadores(prev => ({
        ...prev,
        [componenteIndex]: 'Todos los campos del indicador son requeridos'
      }))
      return
    }

    if (indicador.numeradores.some(n => !n.titulo.trim() || !n.valor.trim())) {
      setErroresIndicadores(prev => ({
        ...prev,
        [componenteIndex]: 'Todos los numeradores deben tener título y valor'
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
      console.log('Estado previo en handleAddIndicador:', JSON.stringify(prev.componentes[componenteIndex], null, 2))
      
      const nuevosComponentes = [...prev.componentes]
      const nuevoIndicador = { ...indicador }
      nuevosComponentes[componenteIndex] = {
        ...nuevosComponentes[componenteIndex],
        indicadores: [...nuevosComponentes[componenteIndex].indicadores, nuevoIndicador],
        nuevoIndicador: { ...indicadorVacio }
      }

      console.log('Nuevo estado después de agregar indicador:', 
        JSON.stringify(nuevosComponentes[componenteIndex], null, 2))

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

  const handleComponenteChange = (componenteIndex, field, value) => {
    setFormData(prev => {
      const nuevosComponentes = [...prev.componentes]
      nuevosComponentes[componenteIndex][field] = value
      return {
        ...prev,
        componentes: nuevosComponentes
      }
    })
  }

  const handleIndicadorEdit = (componenteIndex, indicadorIndex, field, value) => {
    setFormData(prev => {
      const nuevosComponentes = [...prev.componentes]
      const nuevosIndicadores = [...nuevosComponentes[componenteIndex].indicadores]
      nuevosIndicadores[indicadorIndex][field] = value
      nuevosComponentes[componenteIndex].indicadores = nuevosIndicadores
      return {
        ...prev,
        componentes: nuevosComponentes
      }
    })
  }

  const handleAgregarNumerador = (componenteIndex, indicadorIndex) => {
    setFormData(prev => {
      const nuevosComponentes = [...prev.componentes]
      const numerador = {
        titulo: '',
        valor: ''
      }
      if (indicadorIndex !== undefined) {
        // Para indicador existente
        const nuevosIndicadores = [...nuevosComponentes[componenteIndex].indicadores]
        const indicador = { ...nuevosIndicadores[indicadorIndex] }
        const numeradores = indicador.numeradores ? [...indicador.numeradores] : []
        numeradores.push(numerador)
        indicador.numeradores = numeradores
        nuevosIndicadores[indicadorIndex] = indicador
        nuevosComponentes[componenteIndex] = {
          ...nuevosComponentes[componenteIndex],
          indicadores: nuevosIndicadores
        }
      } else {
        // Para nuevo indicador
        const nuevoIndicador = { ...nuevosComponentes[componenteIndex].nuevoIndicador }
        const numeradores = nuevoIndicador.numeradores ? [...nuevoIndicador.numeradores] : []
        numeradores.push(numerador)
        nuevoIndicador.numeradores = numeradores
        nuevosComponentes[componenteIndex] = {
          ...nuevosComponentes[componenteIndex],
          nuevoIndicador
        }
      }
      return {
        ...prev,
        componentes: nuevosComponentes
      }
    })
  }

  const handleNumeradorChange = (componenteIndex, indicadorIndex, numeradorIndex, field, value) => {
    console.log('handleNumeradorChange llamado con:', {
      componenteIndex,
      indicadorIndex,
      numeradorIndex,
      field,
      value
    })
    
    setFormData(prev => {
      const nuevosComponentes = [...prev.componentes]
      if (indicadorIndex !== undefined) {
        nuevosComponentes[componenteIndex].indicadores[indicadorIndex].numeradores[numeradorIndex][field] = value
      } else {
        nuevosComponentes[componenteIndex].nuevoIndicador.numeradores[numeradorIndex][field] = value
      }
      return {
        ...prev,
        componentes: nuevosComponentes
      }
    })
  }

  const handleRemoveNumerador = (componenteIndex, indicadorIndex, numeradorIndex) => {
    setFormData(prev => {
      const nuevosComponentes = [...prev.componentes]
      if (indicadorIndex !== undefined) {
        nuevosComponentes[componenteIndex].indicadores[indicadorIndex].numeradores.splice(numeradorIndex, 1)
      } else {
        nuevosComponentes[componenteIndex].nuevoIndicador.numeradores.splice(numeradorIndex, 1)
      }
      return {
        ...prev,
        componentes: nuevosComponentes
      }
    })
  }

  return (
    <Form onSubmit={handleSubmit} className="convenio-form">
      <div className="seccion-container mb-3 p-3">
        <h4>Datos del Convenio</h4>
        <Form.Group className="mb-3">
          <Form.Label>Nombre del Convenio</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            name="descripcion"
            value={formData.descripcion}
            onChange={e => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
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
                onChange={e => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
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
                onChange={e => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                name="monto"
                value={formData.monto}
                onChange={e => setFormData(prev => ({ ...prev, monto: e.target.value }))}
                required
                min="0"
                step="0.01"
              />
            </Form.Group>
          </Col>
        </Row>
      </div>

      <div className="seccion-container border rounded mb-4 p-3">
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
          <div key={componenteIndex} className="mb-4 p-3 border rounded border-black">
            <h5>
              {modo === "modificar" ? (
                <Form.Control
                  type="text"
                  value={componente.nombre}
                  onChange={e => handleComponenteChange(componenteIndex, 'nombre', e.target.value)}
                />
              ) : (
                <>Componente: {componente.nombre}</>
              )}
            </h5>
            <div className="mb-3">
              <h6>Indicadores</h6>
              {componente.indicadores.map((indicador, indicadorIndex) => (
                <div key={indicadorIndex} className="mb-2 p-2 border rounded">
                  <Row>
                    {modo === "modificar" ? (
                      <>
                        <Col md={3}>
                          <Form.Control
                            type="text"
                            value={indicador.nombre}
                            onChange={e => handleIndicadorEdit(componenteIndex, indicadorIndex, 'nombre', e.target.value)}
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Control
                            type="text"
                            value={indicador.denominador}
                            onChange={e => handleIndicadorEdit(componenteIndex, indicadorIndex, 'denominador', e.target.value)}
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Control
                            type="number"
                            value={indicador.pesoFinal}
                            onChange={e => handleIndicadorEdit(componenteIndex, indicadorIndex, 'pesoFinal', e.target.value)}
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Control
                            type="text"
                            value={indicador.fuente}
                            onChange={e => handleIndicadorEdit(componenteIndex, indicadorIndex, 'fuente', e.target.value)}
                          />
                        </Col>
                        <Col md={1}>
                          <Button 
                            variant="primary"
                            onClick={() => handleAgregarNumerador(componenteIndex, indicadorIndex)}
                          >
                            Agregar Numerador
                          </Button>
                        </Col>
                      </>
                    ) : (
                      <>
                        <Col md={3}><strong>Nombre:</strong> {indicador.nombre}</Col>
                        <Col md={2}><strong>Denominador:</strong> {indicador.denominador}</Col>
                        <Col md={2}><strong>Peso Final:</strong> {indicador.pesoFinal}%</Col>
                        <Col md={2}><strong>Fuente:</strong> {indicador.fuente}</Col>
                      </>
                    )}
                  </Row>
                  {indicador.numeradores && indicador.numeradores.length > 0 && (
                    <div className="mt-2 ms-4">
                      <h6>Numeradores:</h6>
                      {indicador.numeradores.map((numerador, numeradorIndex) => (
                        <Row key={numeradorIndex} className="mb-2 align-items-center">
                          <Col md={4}>
                            <Form.Control
                              type="text"
                              placeholder="Título del numerador"
                              value={numerador.titulo}
                              onChange={e => handleNumeradorChange(componenteIndex, indicadorIndex, numeradorIndex, 'titulo', e.target.value)}
                              disabled={modo !== "modificar"}
                            />
                          </Col>
                          <Col md={4}>
                            <Form.Control
                              type="text"
                              placeholder="Valor del numerador"
                              value={numerador.valor}
                              onChange={e => handleNumeradorChange(componenteIndex, indicadorIndex, numeradorIndex, 'valor', e.target.value)}
                              disabled={modo !== "modificar"}
                            />
                          </Col>
                          {modo === "modificar" && (
                            <Col md={1}>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveNumerador(componenteIndex, indicadorIndex, numeradorIndex)}
                              >
                                Eliminar
                              </Button>
                            </Col>
                          )}
                        </Row>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Row className="align-items-end mb-2">
                <Col md={3}>
                  <Form.Control
                    type="text"
                    placeholder="Nombre"
                    value={componente.nuevoIndicador?.nombre || ''}
                    onChange={e => handleIndicadorChange(componenteIndex, 'nombre', e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="text"
                    placeholder="Denominador"
                    value={componente.nuevoIndicador?.denominador || ''}
                    onChange={e => handleIndicadorChange(componenteIndex, 'denominador', e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Peso Final"
                    value={componente.nuevoIndicador?.pesoFinal || ''}
                    onChange={e => handleIndicadorChange(componenteIndex, 'pesoFinal', e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="text"
                    placeholder="Fuente"
                    value={componente.nuevoIndicador?.fuente || ''}
                    onChange={e => handleIndicadorChange(componenteIndex, 'fuente', e.target.value)}
                  />
                </Col>
                <Col md={1}>
                  <Button 
                    variant="primary"
                    onClick={() => handleAgregarNumerador(componenteIndex)}
                  >
                    Agregar Numerador
                  </Button>
                </Col>
              </Row>
              {componente.nuevoIndicador?.numeradores && componente.nuevoIndicador.numeradores.length > 0 && (
                <div className="mt-2 ms-4">
                  <h6>Numeradores:</h6>
                  {componente.nuevoIndicador.numeradores.map((numerador, numeradorIndex) => (
                    <Row key={numeradorIndex} className="mb-2 align-items-center">
                      <Col md={4}>
                        <Form.Control
                          type="text"
                          placeholder="Título del numerador"
                          value={numerador.titulo}
                          onChange={e => handleNumeradorChange(componenteIndex, undefined, numeradorIndex, 'titulo', e.target.value)}
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          type="text"
                          placeholder="Valor del numerador"
                          value={numerador.valor}
                          onChange={e => handleNumeradorChange(componenteIndex, undefined, numeradorIndex, 'valor', e.target.value)}
                        />
                      </Col>
                      <Col md={1}>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveNumerador(componenteIndex, undefined, numeradorIndex)}
                        >
                          Eliminar
                        </Button>
                      </Col>
                    </Row>
                  ))}
                </div>
              )}
              <Col xs="auto" className="mb-3">
                <Button variant="success" onClick={() => handleAddIndicador(componenteIndex)}>
                  Agregar Indicador
                </Button>
              </Col>
              {erroresIndicadores[componenteIndex] && (
                <div className="text-danger mb-2">{erroresIndicadores[componenteIndex]}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Button variant="primary" type="submit">
        {modo === "crear" ? "Crear Convenio" : "Guardar Cambios"}
      </Button>
    </Form>
  )
}

export default ConvenioForm 