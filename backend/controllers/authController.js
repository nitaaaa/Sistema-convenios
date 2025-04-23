const jwt = require('jsonwebtoken');
// Aquí podrías agregar lógica para conectarte con el servicio de Microsoft

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // Aquí iría la validación tradicional, pero para Outlook/Microsoft haremos la integración OAuth.
  // Ejemplo simplificado: verifica que el email tenga dominio de Outlook (esto es solo un ejemplo, la validación real la hará Microsoft)
  if (!email.endsWith('@saludpm.cl')) {
    return res.status(400).json({ error: 'El correo debe ser de institucional' });
  }
  
  // Lógica de validación de contraseña y usuario...
  // Si se valida, se genera un token JWT:
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};