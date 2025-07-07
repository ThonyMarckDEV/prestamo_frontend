// components/CuotasPagadasList.js
import React, { useState } from 'react';
import ObservacionesTooltip from './modals/ObservacionesTooltip';

// utils/formatDate.js
export const formatDate = (dateString) => {
  if (!dateString) return '';

  // Split the date string to get YYYY-MM-DD
  const [year, month, day] = dateString.split('T')[0].split('-');

  // Return formatted date as DD/MM/YYYY
  return `${day}/${month}/${year}`;
};

const CuotasPagadasList = ({ selectedPrestamoId, cuotasPagadas, onViewCaptura, onViewComprobante }) => {
  const [hoveredCuota, setHoveredCuota] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (cuota, event) => {
    setHoveredCuota(cuota);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredCuota(null);
  };

  if (!selectedPrestamoId) return null;

  if (cuotasPagadas.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
        <p className="text-yellow-800 font-medium">
          NO HAY CUOTAS PAGADAS PARA ESTE PRÉSTAMO.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">CUOTAS PAGADAS</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left font-medium text-gray-700 border-b border-gray-200">
              <th className="py-2 px-4"># CUOTA</th>
              <th className="py-2 px-4">FECHA VENCIMIENTO</th>
              <th className="py-2 px-4">MONTO</th>
              <th className="py-2 px-4">ESTADO</th>
              <th className="py-2 px-4">DÍAS MORA</th>
              <th className="py-2 px-4">MORA</th>
              <th className="py-2 px-4">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {cuotasPagadas.map((cuota) => (
              <tr 
                key={cuota.idCuota} 
                className="border-b last:border-b-0 hover:bg-gray-100 relative"
                onMouseEnter={(e) => handleMouseEnter(cuota, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <td className="py-2 px-4">{cuota.numero_cuota}</td>
                <td className="py-2 px-4">{formatDate(cuota.fecha_vencimiento)}</td>
                <td className="py-2 px-4">S/ {parseFloat(cuota.monto).toFixed(2)}</td>
                <td className="py-2 px-4">
                 <span
                    className={`inline-block py-1 px-2 rounded-full text-xs font-medium ${
                      cuota.estado === 'pagado'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {cuota.estado === 'pagado' ? 'Pagado' : 'Prepagado'}
                  </span>
                </td>
                <td className="py-2 px-4">{cuota.dias_mora}</td>
                <td className="py-2 px-3">
                  S/ {(parseFloat(cuota.mora) || 0).toFixed(2)}
                  {cuota.mora_reducida > 0 && (
                    <span className="text-xs text-green-600 ml-1">(-{cuota.mora_reducida}%)</span>
                  )}
                </td>
                <td className="py-2 px-4 flex gap-2">
                  {cuota.modalidad === 'virtual' && (
                    <button
                      onClick={() => onViewCaptura(cuota.idCuota)}
                      className="bg-accent-yellow-400 hover:bg-accent-yellow-600 text-white text-xs py-1 px-3 rounded-full flex items-center shadow-sm"
                      title="Ver Captura de Pago"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      CAPTURA
                    </button>
                  )}
                  {cuota.estado === 'pagado' && (
                    <button
                      onClick={() => onViewComprobante(cuota.idCuota)}
                      className="bg-primary-light hover:bg-primary-dark text-white text-xs py-1 px-3 rounded-full flex items-center shadow-sm"
                      title="Ver Comprobante de Pago"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ObservacionesTooltip 
        hoveredCuota={hoveredCuota} 
        tooltipPosition={tooltipPosition} 
      />
    </div>
  );
};

export default CuotasPagadasList;