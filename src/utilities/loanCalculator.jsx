// src/utils/loanCalculator.js
export const calculateLoan = (credito, interesPercent, cuotas, otrosPercent = 0.01) => {
  const principal = parseFloat(credito);
  const rateTotal = parseFloat(interesPercent) / 100;
  const periods = parseInt(cuotas, 10);

  if (isNaN(principal) || isNaN(rateTotal) || isNaN(periods) || periods <= 0) {
    return { total: '', cuota: '', percentTotal: '' };
  }

  // 1. Monto de Otros
  const montoDeOtros = principal * otrosPercent;
  // 2. Suma de monto
  const sumaDeMonto = principal + montoDeOtros;
  // 3. Interés sobre la suma de monto
  const interesPrestamo = sumaDeMonto * rateTotal;
  // 4. Total a pagar
  const totalAPagar = sumaDeMonto + interesPrestamo;
  // 5. Valor de cuota
  const cuota = totalAPagar / periods;
  // 6. Porcentaje total sobre el principal
  const percentTotal = ((totalAPagar / principal) * 100).toFixed(2) + '%';

  return {
    total: totalAPagar.toFixed(2),
    cuota: cuota.toFixed(2),
    percentTotal
  };
};

