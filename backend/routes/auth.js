const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { OIDCStrategy } = require('passport-azure-ad')
const { autenticarUsuario } = require('../models/usuarioModel')
const { JWT_EXPIRATION } = require('../../shared/constants.js')

const router = express.Router()

passport.use(new OIDCStrategy({
  identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  responseType: 'code',
  responseMode: 'query',
  redirectUrl: 'https://localhost:3000/auth/microsoft/callback',
  allowHttpForRedirectUrl: true,
  scope: ['openid', 'profile', 'email'],
}, (iss, sub, profile, accessToken, refreshToken, done) => {
  const email = profile._json.preferred_username
  if (!email.endsWith('@saludpm.cl')) {
    return done(null, false, { message: 'Dominio no autorizado' })
  }
  return done(null, profile)
}))

router.use(passport.initialize())

router.get('/microsoft', (req, res, next) => {
  passport.authenticate('azuread-openidconnect', {
    prompt: 'select_account' //Obliga a que el usuario seleccione una cuenta al iniciar sesión
  })(req, res, next);
})

router.get('/microsoft/callback', passport.authenticate('azuread-openidconnect', {
  failureRedirect: `${process.env.FRONTEND_URL}/login`
}), (req, res) => {
  const user = req.user
  const token = jwt.sign({
    email: user._json.preferred_username,
    nombre: user.displayName
  }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRATION })

  res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`)
})

router.post('/login', async (req, res) => {
  try {
    const { rut, contrasena } = req.body;
    
    if (!rut || !contrasena) {
      return res.status(400).json({ 
        message: 'RUT y contraseña son requeridos' 
      });
    }
    
    // Autenticar usuario
    const usuario = await autenticarUsuario(rut, contrasena);
    
    if (!usuario) {
      return res.status(401).json({ 
        message: 'RUT o contraseña incorrectos, o usuario suspendido' 
      });
    }
    
    // Generar token JWT
    const token = jwt.sign({
      email: usuario.correo,
      nombre: `${usuario.nombres} ${usuario.apellido_paterno}`,
      rut: usuario.rut
    }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    
    // Preparar datos del usuario para el frontend
    const userData = {
      nombre: usuario.nombres,
      apellidoPaterno: usuario.apellido_paterno,
      apellidoMaterno: usuario.apellido_materno,
      rut: usuario.rut,
      correo: usuario.correo,
    };
    
    res.json({
      token,
      user: userData,
      message: 'Login exitoso'
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router
