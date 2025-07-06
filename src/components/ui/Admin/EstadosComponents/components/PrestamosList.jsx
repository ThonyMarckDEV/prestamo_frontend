import React from 'react';

const PrestamosList = ({
  selectedCliente,
  cuotasPendientes,
  isEligibleForReprogramacion,
  isEligibleForConvenio,
  isCuotaPagable,
  formatDate,
  handlePagarCuota,
  handleVerCaptura,
  handleVerComprobante,
  handleCancelarPrestamo,
  handleReprogramarPrestamo,
  handleConvenioPrestamo,
  handleSubirCapturaAbono,
  handleReducirMora // Added prop for reducing mora
}) => {
  if (!selectedCliente) return null;

  if (cuotasPendientes.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
        <p className="text-yellow-800">
          EL CLIENTE SELECCIONADO NO TIENE PRÉSTAMOS ACTIVOS O CUOTAS PENDIENTES.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">
        PRÉSTAMOS Y CUOTAS PENDIENTES DE {selectedCliente.nombre} {selectedCliente.apellido}
      </h3>

      {cuotasPendientes.map((prestamo, index) => {
        const hasPrepagadoCuota = prestamo.cuotas.some(cuota => cuota.estado === 'prepagado');
        return (
          <div key={index} className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
              <div>
                <h4 className="font-medium">
                  PRÉSTAMO #{prestamo.prestamo.idPrestamo} - {prestamo.prestamo.modalidad.toUpperCase()}
                </h4>
                <p className="text-sm text-gray-600">
                  MONTO: S/ {parseFloat(prestamo.prestamo.monto).toFixed(2)} - 
                  FRECUENCIA: {prestamo.prestamo.frecuencia.toUpperCase()} - 
                  CUOTAS: {prestamo.prestamo.cuotas} -
                  ABONADO POR: {prestamo.prestamo.abonado_por || 'N/A'}
                </p>
              </div>
              {!hasPrepagadoCuota && (
                <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => handleSubirCapturaAbono(prestamo)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm py-1 px-3 rounded-lg"
                  >
                    SUBIR CAPTURA ABONO
                  </button>
                  {isEligibleForReprogramacion(prestamo) && (
                    <button
                      onClick={() => handleReprogramarPrestamo(prestamo)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-1 px-3 rounded-lg"
                    >
                      REPROGRAMAR PRÉSTAMO
                    </button>
                  )}
                  {isEligibleForConvenio(prestamo) && (
                    <button
                      onClick={() => handleConvenioPrestamo(prestamo)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm py-1 px-3 rounded-lg"
                    >
                      CONVENIO PRÉSTAMO
                    </button>
                  )}
                  <button
                    onClick={() => handleCancelarPrestamo(prestamo)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium text-sm py-1 px-3 rounded-lg"
                  >
                    CANCELAR TOTAL DE PRÉSTAMO
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left font-medium text-gray-700 border-b">
                    <th className="py-2 px-3"># CUOTA</th>
                    <th className="py-2 px-3">FECHA VENCIMIENTO</th>
                    <th className="py-2 px-3">MONTO</th>
                    <th className="py-2 px-3">MONTO A PAGAR</th>
                    <th className="py-2 px-3">EXCEDENTE ANTERIOR</th>
                    <th className="py-2 px-3">ESTADO</th>
                    <th className="py-2 px-3">DÍAS MORA</th>
                    <th className="py-2 px-3">MORA</th>
                    <th className="py-2 px-3">ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamo.cuotas.map((cuota) => (
                    <tr key={cuota.idCuota} className="border-b last:border-b-0 hover:bg-gray-100">
                      <td className="py-2 px-3">{cuota.numero_cuota}</td>
                      <td className="py-2 px-3">{formatDate(cuota.fecha_vencimiento)}</td>
                      <td className="py-2 px-3">
                        S/ {(parseFloat(cuota.monto) + parseFloat(cuota.excedente_anterior || 0)).toFixed(2)}
                      </td>
                      <td className="py-2 px-3">S/ {parseFloat(cuota.monto_a_pagar).toFixed(2)}</td>
                      <td className="py-2 px-3">S/ {parseFloat(cuota.excedente_anterior || 0).toFixed(2)}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-block py-1 px-2 rounded-full text-xs font-medium
                          ${cuota.estado === 'vencido' ? 'bg-red-100 text-red-800' :
                            cuota.estado === 'vence_hoy' ? 'bg-orange-100 text-orange-800' :
                            cuota.estado === 'pagado' ? 'bg-green-100 text-green-800' :
                            cuota.estado === 'prepagado' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                          {cuota.estado === 'vencido' ? 'Vencido' :
                           cuota.estado === 'vence_hoy' ? 'Vence Hoy' :
                           cuota.estado === 'pagado' ? 'Pagado' :
                           cuota.estado === 'prepagado' ? 'Prepagado' :
                           'Pendiente'}
                        </span>
                      </td>
                      <td className="py-2 px-3">{cuota.dias_mora}</td>
                      <td className="py-2 px-3">
                        S/ {(parseFloat(cuota.mora) || 0).toFixed(2)}
                        {cuota.mora_reducida > 0 && (
                          <span className="text-xs text-green-600 ml-1">(-{cuota.mora_reducida}%)</span>
                        )}
                      </td>
                      <td className="py-2 px-3 flex gap-2">
                        {['pagado', 'prepagado'].includes(cuota.estado) ? (
                          <>
                            {(cuota.modalidad === 'virtual' || (cuota.estado === 'prepagado' && !cuota.modalidad)) && (
                              <button
                                onClick={() => handleVerCaptura(prestamo.prestamo, cuota)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded shadow-sm"
                              >
                                VER CAPTURA
                              </button>
                            )}
                            {cuota.estado === 'pagado' && (
                              <button
                                onClick={() => handleVerComprobante(prestamo.prestamo, cuota)}
                                className="bg-red-700 hover:bg-red-800 text-white text-xs py-1 px-2 rounded shadow-sm"
                              >
                                VER COMPROBANTE
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handlePagarCuota(prestamo.prestamo, cuota)}
                              className={`text-xs py-1 px-2 rounded ${
                                isCuotaPagable(prestamo, cuota)
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gray-400 text-white cursor-not-allowed'
                              }`}
                              disabled={!isCuotaPagable(prestamo, cuota)}
                            >
                              PAGAR
                            </button>
                            {(cuota.estado === 'vencido') && !cuota.reduccion_mora_aplicada && (
                              <button
                                onClick={() => handleReducirMora(prestamo.prestamo, cuota)}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded shadow-sm"
                              >
                                REDUCIR MORA
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PrestamosList;
