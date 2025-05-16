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
    numerador: '',
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
    const componente = formData.componentes[componenteIndex]
    const indicador = componente.nuevoIndicador

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
              <Form.Label>Establecimiento</Form.Label>
              <Form.Select
                name="establecimiento"
                value={formData.establecimiento}
                onChange={e => setFormData(prev => ({ ...prev, establecimiento: e.target.value }))}
                required
              >
                <option value="">Seleccione un establecimiento</option>
                {/* Aquí puedes agregar opciones en el futuro */}
              </Form.Select>
            </Form.Group>
          </Col>
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
                            value={indicador.numerador}
                            onChange={e => handleIndicadorEdit(componenteIndex, indicadorIndex, 'numerador', e.target.value)}
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
                      </>
                    ) : (
                      <>
                        <Col md={3}><strong>Nombre:</strong> {indicador.nombre}</Col>
                        <Col md={2}><strong>Numerador:</strong> {indicador.numerador}</Col>
                        <Col md={2}><strong>Denominador:</strong> {indicador.denominador}</Col>
                        <Col md={2}><strong>Peso Final:</strong> {indicador.pesoFinal}%</Col>
                        <Col md={2}><strong>Fuente:</strong> {indicador.fuente}</Col>
                      </>
                    )}
                  </Row>
                </div>
              ))}
              {/* Formulario para agregar un nuevo indicador */}
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
                    placeholder="Numerador"
                    value={componente.nuevoIndicador?.numerador || ''}
                    onChange={e => handleIndicadorChange(componenteIndex, 'numerador', e.target.value)}
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
                <Col xs="auto">
                  <Button variant="success" onClick={() => handleAddIndicador(componenteIndex)}>
                    Agregar Indicador
                  </Button>
                </Col>
              </Row>
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