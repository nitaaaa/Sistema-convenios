import { useState } from 'react'
import { Form, Row, Col } from 'react-bootstrap'

// Función para validar cada regla de la contraseña
const reglasContrasena = [
  {
    texto: 'Mínimo 8 caracteres',
    cumple: (c) => c.length >= 8
  },
  {
    texto: 'Al menos una mayúscula',
    cumple: (c) => /[A-Z]/.test(c)
  },
  {
    texto: 'Al menos un número',
    cumple: (c) => /\d/.test(c)
  },
  {
    texto: 'Al menos un carácter especial (!@#$%^&*?.-_=)',
    cumple: (c) => /[!@#$%^&*?.\-_=]/.test(c)
  }
]

const validarContrasena = (contrasena) => {
  const errores = []
  if (contrasena.length < 8) errores.push('Mínimo 8 caracteres')
  if (!/[A-Z]/.test(contrasena)) errores.push('Al menos una mayúscula')
  if (!/\d/.test(contrasena)) errores.push('Al menos un número')
  if (!/[!@#$%^&*?.\-_=]/.test(contrasena)) errores.push('Al menos un carácter especial (!@#$%^&*?.-_=)')
  return {
    esValida: errores.length === 0,
    errores
  }
}

function ContrasenaForm({ 
  contrasena, 
  setContrasena, 
  confirmarContrasena, 
  setConfirmarContrasena, 
  mostrarValidacion = true,
  minLength = 8,
  requerirConfirmacion = true 
}) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false)
  const [validacionContrasena, setValidacionContrasena] = useState({ esValida: false, errores: [] })

  const handleContrasenaChange = (e) => {
    const value = e.target.value
    setContrasena(value)
    
    if (mostrarValidacion) {
      const validacion = validarContrasena(value)
      setValidacionContrasena(validacion)
    }
  }

  const handleConfirmarContrasenaChange = (e) => {
    setConfirmarContrasena(e.target.value)
  }

  const toggleMostrarContrasena = () => {
    setMostrarContrasena(!mostrarContrasena)
  }

  const toggleMostrarConfirmarContrasena = () => {
    setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)
  }

  return (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={mostrarContrasena ? "text" : "password"}
                value={contrasena}
                onChange={handleContrasenaChange}
                placeholder="Ingrese la contraseña"
                minLength={minLength}
                required
                className={contrasena && mostrarValidacion && (validacionContrasena.esValida ? 'is-valid' : 'is-invalid')}
              />
              <button
                type="button"
                className="btn btn-link position-absolute"
                style={{ right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, border: 'none', background: 'none' }}
                onClick={toggleMostrarContrasena}
                tabIndex="-1"
              >
                {mostrarContrasena ? (
                  <span style={{ fontSize: '1.2rem'}}>👁</span>
                ) : (
                  <span style={{ fontSize: '1.2rem'}}>🔒</span>
                )}
              </button>
            </div>
            {!mostrarValidacion && (
              <Form.Text className="text-muted">
                La contraseña debe tener al menos {minLength} caracteres
              </Form.Text>
            )}
          </Form.Group>
        </Col>

        {requerirConfirmacion && (
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={mostrarConfirmarContrasena ? "text" : "password"}
                  value={confirmarContrasena}
                  onChange={handleConfirmarContrasenaChange}
                  placeholder="Confirme la contraseña"
                  minLength={minLength}
                  required
                  className={confirmarContrasena && (contrasena === confirmarContrasena ? 'is-valid' : 'is-invalid')}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute"
                  style={{ right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, border: 'none', background: 'none' }}
                  onClick={toggleMostrarConfirmarContrasena}
                  tabIndex="-1"
                >
                  {mostrarConfirmarContrasena ? (
                    <span style={{ fontSize: '1.2rem' }}>👁</span>
                  ) : (
                    <span style={{ fontSize: '1.2rem' }}>🔒</span>
                  )}
                </button>
              </div>
              {confirmarContrasena && (
                <div className={`mt-2 ${contrasena === confirmarContrasena ? 'text-success' : 'text-danger'}`}>
                  <small>
                    {contrasena === confirmarContrasena ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                  </small>
                </div>
              )}
            </Form.Group>
          </Col>
        )}
      </Row>
      <Row>
        <Col md={6}>
        {mostrarValidacion && (
            <Form.Text className="text-muted">
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {reglasContrasena.map((regla, idx) => (
                <li key={idx} style={{ color: regla.cumple(contrasena) ? 'green' : 'red', fontWeight: regla.cumple(contrasena) ? 'bold' : 'normal' }}>
                  {regla.cumple(contrasena) ? '✓' : '✗'} {regla.texto}
                </li>
              ))}
            </ul>
            </Form.Text>
        )}
        </Col>
      </Row>
      
    </>
  )
}

export default ContrasenaForm 