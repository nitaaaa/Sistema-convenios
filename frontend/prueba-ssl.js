import fs from 'fs'
import path from 'path'

const keyPath = path.resolve('ssl/key.pem')
const certPath = path.resolve('ssl/cert.pem')

try {
  const key = fs.readFileSync(keyPath)
  const cert = fs.readFileSync(certPath)
  console.log('✅ Certificados cargados correctamente')
} catch (err) {
  console.error('❌ Error leyendo certificados:', err.message)
}
