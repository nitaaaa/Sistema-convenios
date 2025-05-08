import React, { useState } from 'react';
import axios from 'axios';

function CrearEstablecimientoPage() {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/establecimientos/nuevo', { nombre }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMensaje('Establecimiento creado exitosamente');
      setNombre('');
    } catch (err) {
      setError('Error al crear el establecimiento');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Crear Establecimiento</h2>
      <form onSubmit={handleSubmit} className="border rounded p-4 bg-light">
        <div className="mb-3">
          <label className="form-label">Nombre del Establecimiento</label>
          <input
            type="text"
            className="form-control"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Crear</button>
      </form>
      {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}

export default CrearEstablecimientoPage; 