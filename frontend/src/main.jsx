import 'bootstrap/dist/css/bootstrap.min.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LogoPuertoMontt from './assets/LogoPuertoMontt.jpg';
import LogoMuni from './assets/LogoMuni.jpg';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <div style={{
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  }}>
    <img
      src={LogoPuertoMontt}
      alt="Logo Puerto Montt"
      style={{
        position: 'absolute',
        left: '0px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '20vw',
        height: '20vw',
        objectFit: 'cover',
        zIndex: 0
      }}
    />
    <div style={{ zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <StrictMode>
        <App />
      </StrictMode>
    </div>
    <img
      src={LogoMuni}
      alt="Logo Muni"
      style={{
        position: 'absolute',
        right: '0px',
        top: '50%',
        width: '30vw',
        height: 'auto',
        transform: 'translateY(-50%)',
        objectFit: 'cover',
        zIndex: 0
      }}
    />
  </div>
)
