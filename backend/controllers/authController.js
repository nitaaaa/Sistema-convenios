import jwt from 'jsonwebtoken';
import { JWT_EXPIRATION } from '../../shared/constants.js';
// Aquí podrías agregar lógica para conectarte con el servicio de Microsoft

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Aquí iría la validación tradicional, pero para Outlook/Microsoft haremos la integración OAuth.
  // Ejemplo simplificado: verifica que el email tenga dominio de Outlook (esto es solo un ejemplo, la validación real la hará Microsoft)
  if (!email.endsWith('@saludpm.cl')) {
    return res.status(400).json({ error: 'El correo debe ser de institucional' });
  }
  
  // Lógica de validación de contraseña y usuario...
  // Si se valida, se genera un token JWT:
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRATION });
  res.json({ token });
};