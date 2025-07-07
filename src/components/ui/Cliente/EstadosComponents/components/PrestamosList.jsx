import React, { useState } from 'react';
import { formatDate } from './utils/formatDate';
import ObservacionesTooltip from './utils/ObservacionesTooltip';
import CronogramaModal from '../components/modals/CronogramaModal';
import FetchWithGif from '../../../../Reutilizables/FetchWithGif'; 
import { fetchWithAuth } from '../../../../../js/authToken';
import API_BASE_URL from '../../../../../js/urlHelper';

const PrestamosList = ({ cuotasPendientes, handlePagarCuota, handleVerCapturaAbono }) => {
  const [hoveredCuota, setHoveredCuota] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // Determinar si la cuota es pagable
  const isCuotaPagable = (prestamo, cuota) => {
    const sortedCuotas = prestamo.cuotas.sort((a, b) => a.numero_cuota - b.numero_cuota);
    const previousCuotas = sortedCuotas.filter((c) => c.numero_cuota < cuota.numero_cuota);
    const allPreviousPaid = previousCuotas.every((c) => c.estado === 'pagado');
    const isCurrentUnpaid = !['pagado', 'prepagado'].includes(cuota.estado);
    return allPreviousPaid && isCurrentUnpaid;
  };

  // Manejo de hover para mostrar observaciones
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

  // Manejo de clic en "Ver Cronograma"
  const handleVerCronograma = async (prestamo) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/cronograma/generar/${prestamo.prestamo.idPrestamo}`);
      const data = await response.json();
      setIsLoading(false);
      if (response.ok) {
        // Ensure the URL uses HTTPS
        const securePdfUrl = data.pdf_url.replace(/^http:/, 'https:');
        setPdfUrl(securePdfUrl);
        setIsModalOpen(true);
      } else {
        setError(data.message || 'Error al generar el cronograma');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Error al conectar con el servidor');
    }
  };

  // Cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPdfUrl(null);
  };

  if (cuotasPendientes.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
        <p className="text-yellow-800 font-medium">
          No tienes préstamos activos o cuotas pendientes.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {isLoading && <FetchWithGif />} {/* Render loading GIF when isLoading is true */}
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Tus Préstamos y Cuotas Pendientes</h3>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {cuotasPendientes.map((prestamo, index) => (
        <div
          key={index}
          className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="mb-3 flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">
                Préstamo #{prestamo.prestamo.idPrestamo} - {prestamo.prestamo.modalidad}
              </h4>
              <p className="text-sm text-gray-600">
                Monto: S/ {parseFloat(prestamo.prestamo.monto).toFixed(2)} - Frecuencia:{' '}
                {prestamo.prestamo.frecuencia} - Cuotas: {prestamo.prestamo.cuotas}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleVerCapturaAbono(prestamo)}
                className="text-xs py-1 px-3 rounded-full bg-accent-yellow-400 hover:bg-accent-yellow-600 text-white"
              >
                Ver Abono
              </button>
              <button
                onClick={() => handleVerCronograma(prestamo)}
                className="text-xs py-1 px-3 rounded-full bg-primary-light hover:bg-primary-dark text-white"
              >
                Ver Cronograma
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left font-medium text-gray-700 border-b border-gray-200">
                  <th className="py-2 px-4"># Cuota</th>
                  <th className="py-2 px-4">Fecha Vencimiento</th>
                  <th className="py-2 px-4">Monto a Pagar</th>
                  <th className="py-2 px-4">Estado</th>
                  <th className="py-2 px-4">Días Mora</th>
                  <th className="py-2 px-4">Mora</th>
                  <th className="py-2 px-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {prestamo.cuotas
                  .filter((cuota) => !['pagado', 'prepagado'].includes(cuota.estado))
                  .map((cuota) => (
                    <tr
                      key={cuota.idCuota}
                      className="border-b last:border-b-0 hover:bg-gray-100 relative"
                      onMouseEnter={(e) => handleMouseEnter(cuota, e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <td className="py-2 px-4">{cuota.numero_cuota}</td>
                      <td className="py-2 px-4">{formatDate(cuota.fecha_vencimiento)}</td>
                      <td className="py-2 px-4">
                        S/ {parseFloat(cuota.monto_a_pagar).toFixed(2)}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`inline-block py-1 px-2 rounded-full text-xs font-medium
                          ${cuota.estado === 'vencido' ? 'bg-red-100 text-red-800' : cuota.estado === 'vence_hoy' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {cuota.estado === 'vencido'
                            ? 'Vencido'
                            : cuota.estado === 'vence_hoy'
                            ? 'Vence Hoy'
                            : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-2 px-4">{cuota.dias_mora}</td>
                      <td className="py-2 px-3">
                        S/ {(parseFloat(cuota.mora) || 0).toFixed(2)}
                        {cuota.mora_reducida > 0 && (
                          <span className="text-xs text-green-600 ml-1">(-{cuota.mora_reducida}%)</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => handlePagarCuota(prestamo.prestamo, cuota)}
                          className={`text-xs py-1 px-3 rounded-full ${
                            isCuotaPagable(prestamo, cuota)
                              ? 'bg-primary-light hover:bg-primary-dark text-white'
                              : 'bg-gray-400 text-white cursor-not-allowed'
                          }`}
                          disabled={!isCuotaPagable(prestamo, cuota)}
                        >
                          Pagar
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <ObservacionesTooltip hoveredCuota={hoveredCuota} tooltipPosition={tooltipPosition} />
      <CronogramaModal isOpen={isModalOpen} pdfUrl={pdfUrl} onClose={handleCloseModal} />
    </div>
  );
};

export default PrestamosList;