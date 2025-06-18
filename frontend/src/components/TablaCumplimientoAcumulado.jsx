import React from 'react';

function TablaCumplimientoAcumulado({ meses, porcentajeAcumulado }) {
  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: 8, 
      boxShadow: '0 2px 8px #0001', 
      padding: 16,
      marginBottom: 32
    }}>
      <h4 style={{ marginBottom: 16 }}>Cumplimiento del Convenio</h4>
      <div style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Mes</th>
              <th className="text-end">Cumplimiento</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((mes, index) => (
              <tr key={mes}>
                <td>{mes}</td>
                <td className="text-end">{Number(porcentajeAcumulado[index]).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaCumplimientoAcumulado; 