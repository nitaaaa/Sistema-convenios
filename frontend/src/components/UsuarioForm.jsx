import { useState, useEffect } from 'react'
import { Form, Button, Alert, Row, Col } from 'react-bootstrap'
import './UsuarioForm.css'
import cleanIcon from '../assets/clean.png'
import { formatRut, validarRut } from '../utils/rutUtils'
import { obtenerTodosLosEstablecimientosPM } from '../services/establecimientoService'
import ContrasenaForm from './ContrasenaForm'

// Función para validar contraseña según las restricciones
const validarContrasena = (contrasena) => {
  const errores = []
  
  // Mínimo 8 caracteres
  if (contrasena.length < 8) {
    errores.push('Mínimo 8 caracteres')
  }
  
  // Al menos una mayúscula
  if (!/[A-Z]/.test(contrasena)) {
    errores.push('Al menos una mayúscula')
  }
  
  // Al menos un número
  if (!/\d/.test(contrasena)) {
    errores.push('Al menos un número')
  }
  
  // Al menos un carácter especial
  if (!/[!@#$%^&*?.\-_=]/.test(contrasena)) {
    errores.push('Al menos un carácter especial (!@#$%^&*?.-_=)')
  }
  
  return {
    esValida: errores.length === 0,
    errores
  }
}

function UsuarioForm({ initialData = {}, onSubmit, modo = "crear" }) {
  const [formData, setFormData] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    rut: '',
    correo: '',
    establecimiento: '',
    contrasena: '',
    confirmarContrasena: '',
    suspendido: false,
    ...initialData,
    // Asegurar que suspendido siempre sea un booleano
    suspendido: initialData.suspendido ?? false
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [establecimientos, setEstablecimientos] = useState([])
  const [selectedEstablecimientos, setSelectedEstablecimientos] = useState([])

  // Cargar establecimientos de Puerto Montt al montar el componente
  useEffect(() => {
    const cargarEstablecimientos = async () => {
      try {
        const data = await obtenerTodosLosEstablecimientosPM()
        setEstablecimientos(data)
      } catch (error) {
        console.error('Error al cargar establecimientos:', error)
      }
    }
    cargarEstablecimientos()
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Actualizar formData cuando cambie initialData
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        rut: '',
        correo: '',
        establecimiento: '',
        contrasena: '',
        confirmarContrasena: '',
        suspendido: false,
        ...initialData,
        // Asegurar que suspendido siempre sea un booleano
        suspendido: initialData.suspendido ?? false
      })
      
      // Si hay establecimientos en initialData, configurar la selección
      if (initialData.establecimiento) {
        const establecimientosIds = initialData.establecimiento.split(',').map(id => id.trim())
        setSelectedEstablecimientos(establecimientosIds)
      }
    }
  }, [initialData])

  // Formatear RUT
  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Aplicar formato RUT solo al campo rut
    if (name === 'rut') {
      const formattedRut = formatRut(value)
      setFormData(prev => ({
        ...prev,
        [name]: formattedRut
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Manejar cambios en los establecimientos
  const handleEstablecimientoChange = (e) => {
    const { value, checked } = e.target
    
    if (checked) {
      const newSelected = [...selectedEstablecimientos, value]
      setSelectedEstablecimientos(newSelected)
      setFormData(prev => ({
        ...prev,
        establecimiento: newSelected.join(', ')
      }))
    } else {
      const newSelected = selectedEstablecimientos.filter(id => id !== value)
      setSelectedEstablecimientos(newSelected)
      setFormData(prev => ({
        ...prev,
        establecimiento: newSelected.join(', ')
      }))
    }
  }

  // Manejar la selección de todos los establecimientos
  const handleSelectAllEstablecimientos = (e) => {
    const { checked } = e.target
    
    if (checked) {
      // Seleccionar todos los establecimientos
      const allIds = establecimientos.map(est => est.id.toString())
      setSelectedEstablecimientos(allIds)
      setFormData(prev => ({
        ...prev,
        establecimiento: allIds.join(', ')
      }))
    } else {
      // Deseleccionar todos
      setSelectedEstablecimientos([])
      setFormData(prev => ({
        ...prev,
        establecimiento: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validar RUT antes de proceder
    if (formData.rut && !validarRut(formData.rut)) {
      setError('El RUT ingresado no es válido')
      return
    }

    // Validar dominio del correo
    if (formData.correo && !formData.correo.endsWith('@saludpm.cl')) {
      setError('El correo debe ser del dominio @saludpm.cl')
      return
    }

    // Validar que se haya seleccionado al menos un establecimiento
    if (selectedEstablecimientos.length === 0) {
      setError('Debe seleccionar al menos un establecimiento')
      return
    }

    // Validar contraseñas (solo en modo crear)
    if (modo === "crear") {
      if (!formData.contrasena) {
        setError('La contraseña es obligatoria')
        return
      }
      
      // Validar que la contraseña cumpla con todas las restricciones
      const validacionContrasena = validarContrasena(formData.contrasena)
      if (!validacionContrasena.esValida) {
        setError('La contraseña no cumple con los requisitos: ' + validacionContrasena.errores.join(', '))
        return
      }
      
      if (formData.contrasena !== formData.confirmarContrasena) {
        setError('Las contraseñas no coinciden')
        return
      }
    }

    try {
      await onSubmit(formData)
      // El componente padre manejará el success/error
    } catch (error) {
      setError('Error al ' + (modo === "crear" ? "crear" : "modificar") + ' el usuario')
    }
  }

  const handleLimpiar = () => {
    setFormData({
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      rut: '',
      correo: '',
      establecimiento: '',
      contrasena: '',
      confirmarContrasena: '',
      suspendido: false
    })
    setSelectedEstablecimientos([])
    setError('')
    setSuccess('')
  }

  return (
    <div className="usuario-form seccion-container">
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Apellido Paterno</Form.Label>
              <Form.Control
                type="text"
                name="apellido_paterno"
                value={formData.apellido_paterno}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Apellido Materno</Form.Label>
              <Form.Control
                type="text"
                name="apellido_materno"
                value={formData.apellido_materno}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                readOnly={modo === "editar"}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Campos de contraseña solo en modo crear */}
        {modo === "crear" && (
          <ContrasenaForm
            contrasena={formData.contrasena}
            setContrasena={(value) => setFormData(prev => ({ ...prev, contrasena: value }))}
            confirmarContrasena={formData.confirmarContrasena}
            setConfirmarContrasena={(value) => setFormData(prev => ({ ...prev, confirmarContrasena: value }))}
            mostrarValidacion={true}
            minLength={8}
            requerirConfirmacion={true}
          />
        )}

        <Row>    
          
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Establecimientos</Form.Label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ced4da', borderRadius: '0.375rem', padding: '10px', backgroundColor: 'white' }}>
                  <Form.Check
                    type="checkbox"
                    id="select-all-establecimientos-edit"
                    label="Seleccionar todos"
                    checked={selectedEstablecimientos.length === establecimientos.length && establecimientos.length > 0}
                    onChange={handleSelectAllEstablecimientos}
                    className="mb-2"
                  />
                  <hr className="my-2" />
                  {establecimientos.map(est => (
                    <Form.Check
                      key={est.id}
                      type="checkbox"
                      id={`est-edit-${est.id}`}
                      label={est.nombre}
                      value={est.id}
                      checked={selectedEstablecimientos.includes(est.id.toString())}
                      onChange={handleEstablecimientoChange}
                      className="mb-2"
                    />
                  ))}
                </div>
                {selectedEstablecimientos.length === 0 && (
                  <Form.Text className="text-danger">
                    * Debe seleccionar al menos un establecimiento
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
              />
              <Form.Text className="text-muted">
                Debe ser un correo del dominio @saludpm.cl
              </Form.Text>
            </Form.Group>
          </Col>
          
        </Row>

        {/* Checkbox de Suspendido solo en modo editar */}
        {modo === "editar" && (
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" >
                <Form.Check
                  type="checkbox"
                  id="suspendido"
                  label="Suspendido"
                  checked={formData.suspendido}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    suspendido: e.target.checked
                  }))
                }
                />
                <Form.Text className="text-muted">
                  Marque esta casilla si desea suspender el acceso del usuario al sistema
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        )}

        

        

        <div className="d-flex gap-2 justify-content-center">
          <Button variant="primary" type="submit">
            {modo === "crear" ? "Crear Usuario" : "Guardar Cambios"}
          </Button>
          {modo === "crear" && (
            <Button variant="secondary" type="button" onClick={handleLimpiar} title="Limpiar campos">
              <img src={cleanIcon} alt="Limpiar" style={{ width: 20, marginRight: 6, marginBottom: 3 }} /> Limpiar
            </Button>
          )}
        </div>
      </Form>
    </div>
  )
}

export default UsuarioForm