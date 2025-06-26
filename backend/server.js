//server.js
const fs = require('fs')
const https = require('https')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const powerbiRoutes = require('./routes/powerbi')
const usuarioRoutes = require('./routes/usuario')
const establecimientoRoutes = require('./routes/establecimientos')
const comunasRoutes = require('./routes/comunas')
const convenioRoutes = require('./routes/convenio')
const remRoutes = require('./routes/rem')
const resultadosCalculoRoutes = require('./routes/resultadosCalculo')
const verifyToken = require('./middlewares/auth')



// Cargar variables de entorno
dotenv.config()

const app = express()

const session = require('express-session')
app.use(session({
  secret: 'una_clave_secreta_segura',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // pon true si usas HTTPS en producción con dominio válido
}))

const passport = require('passport')
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})
const authRoutes = require('./routes/auth')

// Middleware
app.use(cors())
app.use(express.json())
app.use(passport.initialize())

// Rutas de autenticación
app.use('/auth', authRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/powerbi', powerbiRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/establecimientos', establecimientoRoutes)
app.use('/api/comunas', comunasRoutes)
app.use('/api/convenios', convenioRoutes)
app.use('/api/rem', verifyToken, remRoutes)
app.use('/api/resultados-calculo', verifyToken, resultadosCalculoRoutes)

// Leer certificados SSL
const httpsOptions = {
  key: fs.readFileSync('./config/ssl/key.pem'),
  cert: fs.readFileSync('./config/ssl/cert.pem')
}

const PORT = process.env.PORT || 3000

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Servidor HTTPS corriendo en el puerto ${PORT}`)
})
