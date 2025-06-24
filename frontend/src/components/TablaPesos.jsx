import React from 'react';

function TablaPesos({ indicadores, resultados }) {
  // Obtener los pesos finales de los indicadores
  const pesosIndicadores = indicadores.map(indicador => {
    // Buscar el peso_final en el primer establecimiento y mes disponible
    const primerEstablecimiento = Object.values(resultados)[0];
    const primerMes = primerEstablecimiento ? Object.keys(primerEstablecimiento)[0] : null;
    const peso = primerEstablecimiento?.[primerMes]?.find(f => f.indicador === indicador)?.peso_final || 0;

    return {
      indicador,
      peso
    };
  });

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: 8, 
      boxShadow: '0 2px 8px #0001', 
      padding: 16,
      marginBottom: 32
    }}>
      <h4 style={{ marginBottom: 16 }}>Pesos por Indicador</h4>
      <div style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Indicador</th>
              <th className="text-end">Peso Final</th>
            </tr>
          </thead>
          <tbody>
            {pesosIndicadores.map(({ indicador, peso }) => (
              <tr key={indicador}>
                <td>{indicador}</td>
                <td className="text-end">{Number(peso).toFixed(0) + '%'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaPesos; 