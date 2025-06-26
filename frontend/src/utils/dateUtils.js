/**
 * Ordena un array de meses en orden cronológico
 * @param {Array} meses - Array de pares [mes, valor]
 * @returns {Array} - Array ordenado cronológicamente
 */
export const ordenarMeses = (meses) => {
  const ordenMeses = {
    'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4,
    'Mayo': 5, 'Junio': 6, 'Julio': 7, 'Agosto': 8,
    'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
  };

  
  
  return meses.sort(([mesA], [mesB]) => ordenMeses[mesA] - ordenMeses[mesB]);
}; 

// Lista de meses
export const meses = [
  { valor: '1', nombre: 'Enero' },
  { valor: '2', nombre: 'Febrero' },
  { valor: '3', nombre: 'Marzo' },
  { valor: '4', nombre: 'Abril' },
  { valor: '5', nombre: 'Mayo' },
  { valor: '6', nombre: 'Junio' },
  { valor: '7', nombre: 'Julio' },
  { valor: '8', nombre: 'Agosto' },
  { valor: '9', nombre: 'Septiembre' },
  { valor: '10', nombre: 'Octubre' },
  { valor: '11', nombre: 'Noviembre' },
  { valor: '12', nombre: 'Diciembre' }
];