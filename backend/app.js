const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const powerbiRoutes = require('./routes/powerbi')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/powerbi', powerbiRoutes)

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
}) 