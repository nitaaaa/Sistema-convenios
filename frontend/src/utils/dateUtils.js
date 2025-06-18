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