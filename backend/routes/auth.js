const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { OIDCStrategy } = require('passport-azure-ad')

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
  }, process.env.JWT_SECRET, { expiresIn: '1h' })

  res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`)
})

module.exports = router
