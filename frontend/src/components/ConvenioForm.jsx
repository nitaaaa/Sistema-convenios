import { useState, useEffect } from 'react'
import { Form, Button, Alert, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap'
import './ConvenioForm.css'
import CuotasForm from './CuotasForm'

function ConvenioForm({ initialData, onSubmit, modo}) {
  const [formData, setFormData] = useState({
    ...initialData,
    cuotas: initialData?.cuotas || []
  })
  const [erroresIndicadores, setErroresIndicadores] = useState({})
  const [indicadorEditando, setIndicadorEditando] = useState({ componente: null, indicador: null });

  const indicadorVacio = {
    nombre: '',
    formulas: [],
    pesoFinal: '',
    fuente: ''
  }

  const [nuevoComponente, setNuevoComponente] = useState({
    nombre: '',
    indicadores: [],
    nuevoIndicador: { ...indicadorVacio }
  })

  // Función para formatear el monto con separadores de miles
  const formatearMonto = (valor) => {
    if (!valor) return '';
    // Remover cualquier separador existente y convertir a número
    const numero = valor.toString().replace(/\./g, '');
    // Formatear con separadores de miles
    return numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Función para limpiar el formato del monto
  const limpiarFormatoMonto = (valor) => {
    if (!valor) return '';
    // Remover todos los puntos y convertir a número
    return valor.toString().replace(/\./g, '');
  };

  // Formatear el monto cuando se cargan los datos iniciales
  useEffect(() => {
    if (initialData?.monto) {
      setFormData(prev => ({
        ...prev,
        monto: formatearMonto(initialData.monto)
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Limpiar el formato del monto antes de enviar
      const datosParaEnviar = {
        ...formData,
        monto: limpiarFormatoMonto(formData.monto)
      };
      await onSubmit(datosParaEnviar)
    } catch (error) {
      // No setError aquí
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'monto') {
      // Solo permitir números y puntos
      const valorLimpio = value.replace(/[^\d.]/g, '');
      // Formatear el monto
      const montoFormateado = formatearMonto(valorLimpio);
      setFormData(prev => ({
        ...prev,
        [name]: montoFormateado
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }

  const handleAddComponente = () => {
    if (nuevoComponente.nombre.trim() === '') {
      // No setError aquí
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
        !indicador.formulas?.length ||
        indicador.pesoFinal.trim() === '' || 
        indicador.fuente.trim() === '') {
      setErroresIndicadores(prev => ({
        ...prev,
        [componenteIndex]: 'Todos los campos del indicador son requeridos'
      }))
      return
    }

    if (indicador.formulas.some(f => !f.titulo.trim() || !f.numerador.trim() || !f.denominador.trim())) {
      setErroresIndicadores(prev => ({
        ...prev,
        [componenteIndex]: 'Todos los elementos de la fórmula deben tener título, numerador y denominador'
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
        nuevoIndicador: { ...indicadorVacio }
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

  const handleAgregarFormula = (componenteIndex, indicadorIndex) => {
    setFormData(prev => {
      const nuevosComponentes = [...prev.componentes]
      const formula = {
        titulo: '',
        numerador: '',
        denominador: ''
      }
      if (indicadorIndex !== undefined) {
        // Para indicador existente
        const nuevosIndicadores = [...nuevosComponentes[componenteIndex].indicadores]
        const indicador = { ...nuevosIndicadores[indicadorIndex] }
        const formulas = indicador.formulas ? [...indicador.formulas] : []
        formulas.push(formula)
        indicador.formulas = formulas
        nuevosIndicadores[indicadorIndex] = indicador
        nuevosComponentes[componenteIndex] = {
          ...nuevosComponentes[componenteIndex],
          indicadores: nuevosIndicadores
        }
      } else {
        // Para nuevo indicador
        const nuevoIndicador = { ...nuevosComponentes[componenteIndex].nuevoIndicador }
        const formulas = nuevoIndicador.formulas ? [...nuevoIndicador.formulas] : []
        formulas.push(formula)
        nuevoIndicador.formulas = formulas
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

  const handleFormulaChange = (componenteIndex, indicadorIndex, formulaIndex, field, value) => {
    setFormData(prev => {
      const nuevosComponentes = [...prev.componentes]
      if (indicadorIndex !== undefined) {
        nuevosComponentes[componenteIndex].indicadores[indicadorIndex].formulas[formulaIndex][field] = value
      } else {
        nuevosComponentes[componenteIndex].nuevoIndicador.formulas[formulaIndex][field] = value
      }
      return {
        ...prev,
        componentes: nuevosComponentes
      }
    })
  }

  const handleRemoveFormula = (componenteIndex, indicadorIndex, formulaIndex) => {
    setFormData(prev => {
      const nuevosComponentes = [...prev.componentes]
      if (indicadorIndex !== undefined) {
        nuevosComponentes[componenteIndex].indicadores[indicadorIndex].formulas.splice(formulaIndex, 1)
      } else {
        nuevosComponentes[componenteIndex].nuevoIndicador.formulas.splice(formulaIndex, 1)
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
                value={formData.inicio}
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
                value={formData.termino}
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
                type="text"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                required
                placeholder="Ej: 1.000.000"
              />
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* Sección de Cuotas */}
      <div className="seccion-container mb-3 p-3">
        <CuotasForm 
          cuotas={formData.cuotas || []} 
          setCuotas={(cuotas) => setFormData(prev => ({ ...prev, cuotas }))}
          modo={modo}
        />
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
                    {(modo === "modificar" || (indicadorEditando.componente === componenteIndex && indicadorEditando.indicador === indicadorIndex)) ? (
                      <>
                        <Col md={3}>
                          <Form.Control
                            type="text"
                            value={indicador.nombre}
                            onChange={e => handleIndicadorEdit(componenteIndex, indicadorIndex, 'nombre', e.target.value)}
                            disabled={!(indicadorEditando.componente === componenteIndex && indicadorEditando.indicador === indicadorIndex)}
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Control
                            type="text"
                            value={indicador.pesoFinal || indicador.peso_final || ''}
                            onChange={e => handleIndicadorEdit(componenteIndex, indicadorIndex, 'pesoFinal', e.target.value)}
                            disabled={!(indicadorEditando.componente === componenteIndex && indicadorEditando.indicador === indicadorIndex)}
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Control
                            type="text"
                            value={indicador.fuente}
                            onChange={e => handleIndicadorEdit(componenteIndex, indicadorIndex, 'fuente', e.target.value)}
                            disabled={!(indicadorEditando.componente === componenteIndex && indicadorEditando.indicador === indicadorIndex)}
                          />
                        </Col>
                        <Col md={1}>
                          <Button 
                            variant="primary"
                            onClick={() => handleAgregarFormula(componenteIndex, indicadorIndex)}
                            disabled={!(indicadorEditando.componente === componenteIndex && indicadorEditando.indicador === indicadorIndex)}
                          >
                            Agregar Fórmula
                          </Button>
                        </Col>
                        <Col md={2}>
                          {indicadorEditando.componente === componenteIndex && indicadorEditando.indicador === indicadorIndex ? (
                            <Button variant="success" onClick={() => setIndicadorEditando({ componente: null, indicador: null })}>Guardar</Button>
                          ) : (
                            <Button variant="warning" onClick={() => setIndicadorEditando({ componente: componenteIndex, indicador: indicadorIndex })}>Editar</Button>
                          )}
                        </Col>
                      </>
                    ) : (
                      <>
                        <Col md={3}><strong>Nombre:</strong> {indicador.nombre}</Col>
                        <Col md={2}><strong>Peso Final:</strong> {indicador.pesoFinal}%</Col>
                        <Col md={2}><strong>Fuente:</strong> {indicador.fuente}</Col>
                        <Col md={2}>
                          <Button variant="warning" onClick={() => setIndicadorEditando({ componente: componenteIndex, indicador: indicadorIndex })}>Editar</Button>
                        </Col>
                      </>
                    )}
                  </Row>
                  {indicador.formulas && indicador.formulas.length > 0 && (
                    <div className="mt-2 ms-4">
                      <h6>Fórmula de cálculo:</h6>
                      {indicador.formulas.map((formula, formulaIndex) => (
                        <Row key={formulaIndex} className="mb-2 align-items-center">
                          <Col md={3}>
                            <Form.Control
                              type="text"
                              placeholder="Título"
                              value={formula.titulo}
                              onChange={e => handleFormulaChange(componenteIndex, indicadorIndex, formulaIndex, 'titulo', e.target.value)}
                              disabled={!(indicadorEditando.componente === componenteIndex && indicadorEditando.indicador === indicadorIndex)}
                            />
                          </Col>
                          <Col md={3}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Form.Control
                              type="text"
                              placeholder="Numerador"
                              value={formula.numerador}
                              onChange={e => handleFormulaChange(componenteIndex, indicadorIndex, formulaIndex, 'numerador', e.target.value)}
                                disabled={!(indicadorEditando.componente === componenteIndex && indicadorEditando.indicador === indicadorIndex)}
                              />
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip id={`tooltip-numerador-${componenteIndex}-${indicadorIndex}-${formulaIndex}`}>Puedes ingresar múltiples casillas separadas por coma, por ejemplo: A1,B2,C3</Tooltip>}
                              >
                                <span style={{ marginLeft: 6, cursor: 'pointer', color: '#0d6efd', fontSize: 18 }} title="Ayuda">&#9432;</span>
                              </OverlayTrigger>
                            </div>
                          </Col>
                          <Col md={3}>
                            <Form.Control
                              type="text"
                              placeholder="Denominador"
                              value={formula.denominador}
                              onChange={e => handleFormulaChange(componenteIndex, indicadorIndex, formulaIndex, 'denominador', e.target.value)}
                              disabled={!(indicadorEditando.componente === componenteIndex && indicadorEditando.indicador === indicadorIndex)}
                            />
                          </Col>
                          {indicadorEditando.componente === componenteIndex && indicadorEditando.indicador === indicadorIndex && (
                            <Col md={1}>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveFormula(componenteIndex, indicadorIndex, formulaIndex)}
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
                    onClick={() => handleAgregarFormula(componenteIndex)}
                  >
                    Agregar Fórmula
                  </Button>
                </Col>
              </Row>
              {componente.nuevoIndicador?.formulas && componente.nuevoIndicador.formulas.length > 0 && (
                <div className="mt-2 ms-4">
                  <h6>Fórmula de cálculo:</h6>
                  {componente.nuevoIndicador.formulas.map((formula, formulaIndex) => (
                    <Row key={formulaIndex} className="mb-2 align-items-center">
                      <Col md={3}>
                        <Form.Control
                          type="text"
                          placeholder="Título"
                          value={formula.titulo}
                          onChange={e => handleFormulaChange(componenteIndex, undefined, formulaIndex, 'titulo', e.target.value)}
                        />
                      </Col>
                      <Col md={3}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Form.Control
                          type="text"
                          placeholder="Numerador"
                          value={formula.numerador}
                          onChange={e => handleFormulaChange(componenteIndex, undefined, formulaIndex, 'numerador', e.target.value)}
                        />
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-numerador-${componenteIndex}-${formulaIndex}`}>Puedes ingresar múltiples casillas separadas por coma, por ejemplo: A1,B2,C3</Tooltip>}
                          >
                            <span style={{ marginLeft: 6, cursor: 'pointer', color: '#0d6efd', fontSize: 18 }} title="Ayuda">&#9432;</span>
                          </OverlayTrigger>
                        </div>
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          type="text"
                          placeholder="Denominador"
                          value={formula.denominador}
                          onChange={e => handleFormulaChange(componenteIndex, undefined, formulaIndex, 'denominador', e.target.value)}
                        />
                      </Col>
                      <Col md={1}>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveFormula(componenteIndex, undefined, formulaIndex)}
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

      <Button variant="primary" type="submit">
        {modo === "crear" ? "Crear Convenio" : "Guardar Cambios"}
      </Button>
    </Form>
  )
}

export default ConvenioForm 