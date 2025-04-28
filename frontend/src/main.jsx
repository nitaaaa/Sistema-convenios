import 'bootstrap/dist/css/bootstrap.min.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LogoPuertoMontt from './assets/LogoPuertoMontt.jpg';
import LogoMuni from './assets/LogoMuni.jpg';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <div style={{ 
    backgroundImage: `url(${LogoPuertoMontt}), url(${LogoMuni})`, 
    backgroundPosition: 'left center, right center',
    backgroundRepeat: 'no-repeat, no-repeat',
    backgroundSize: '400px 400px, 400px 400px', // Ajusta el tamaño de cada imagen
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
  <StrictMode>
    <App />
  </StrictMode>,
  </div>
)
