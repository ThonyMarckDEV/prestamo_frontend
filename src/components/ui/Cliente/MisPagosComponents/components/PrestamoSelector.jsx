// components/PrestamoSelector.js
import React from 'react';

const PrestamoSelector = ({ prestamos, selectedPrestamoId, onSelectPrestamo }) => {
  if (prestamos.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
        <p className="text-yellow-800 font-medium">
          NO TIENES PRÉSTAMOS ACTIVOS CON CUOTAS PAGADAS.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Selecciona un Préstamo</h3>
      <select
        value={selectedPrestamoId || ''}
        onChange={(e) => onSelectPrestamo(Number(e.target.value))}
        className="w-full sm:w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-colors border-gray-300"
      >
        {prestamos.map((prestamo) => (
          <option key={prestamo.prestamo.idPrestamo} value={prestamo.prestamo.idPrestamo}>
            Préstamo #{prestamo.prestamo.idPrestamo} - {prestamo.prestamo.modalidad} (S/ {parseFloat(prestamo.prestamo.monto).toFixed(2)})
          </option>
        ))}
      </select>
    </div>
  );
};

export default PrestamoSelector;