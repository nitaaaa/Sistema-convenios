import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

let httpsOptions = {}

try {
  httpsOptions = {
    key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
  }
  console.log("✅ Certificados cargados en Vite")
} catch (error) {
  console.error("❌ Error cargando certificados en Vite:", error.message)
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    https: httpsOptions,
    proxy: {
      '/api': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

