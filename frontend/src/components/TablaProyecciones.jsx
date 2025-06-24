import React from 'react';

function TablaProyecciones() {
  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: 8, 
      boxShadow: '0 2px 8px #0001', 
      padding: 16,
      marginBottom: 32
    }}>
      <h4 style={{ marginBottom: 16 }}>Proyecciones de Cumplimiento</h4>
      <div style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th className="text-end">Fecha limite</th>
              <th className="text-end">Crecimiento Mínimo Requerido</th>
              <th className="text-end">Promedio de Crecimiento Actual</th>
              <th className="text-end">Descuento Proyectado</th>
              <th className="text-end">Monto Final</th>
            </tr>
          </thead>
          <tbody>
            {/* Aquí irán los datos calculados */}
            <tr>
              <td colSpan="5" className="text-center text-muted">
                Seleccione un convenio y establecimiento para ver las proyecciones
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaProyecciones; 