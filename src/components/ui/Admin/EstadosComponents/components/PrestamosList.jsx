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
  handleReducirMora
}) => {
  if (!selectedCliente) return null;

  if (cuotasPendientes.length === 0) {
    return (
      <div className="p-4 bg-accent-mint-100 border border-accent-mint rounded-lg mb-6">
        <p className="text-accent-steel-600">
          EL CLIENTE SELECCIONADO NO TIENE PRÉSTAMOS ACTIVOS O CUOTAS PENDIENTES.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-neutral-dark">
        PRÉSTAMOS Y CUOTAS PENDIENTES DE {selectedCliente.nombre} {selectedCliente.apellido}
      </h3>

      {cuotasPendientes.map((prestamo, index) => {
        const hasPrepagadoCuota = prestamo.cuotas.some(cuota => cuota.estado === 'prepagado');
        return (
          <div key={index} className="mb-4 bg-neutral-softWhite p-3 rounded-lg border border-neutral-gray">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
              <div>
                <h4 className="font-medium text-neutral-dark">
                  PRÉSTAMO #{prestamo.prestamo.idPrestamo} - {prestamo.prestamo.modalidad.toUpperCase()}
                </h4>
                <p className="text-sm text-neutral-dark">
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
                    className="bg-accent-copper hover:bg-accent-copper-600 text-neutral-white font-medium text-sm py-1 px-3 rounded-lg shadow-sm"
                  >
                    SUBIR CAPTURA ABONO
                  </button>
                  {isEligibleForReprogramacion(prestamo) && (
                    <button
                      onClick={() => handleReprogramarPrestamo(prestamo)}
                      className="bg-primary hover:bg-primary-600 text-neutral-white font-medium text-sm py-1 px-3 rounded-lg shadow-sm"
                    >
                      REPROGRAMAR PRÉSTAMO
                    </button>
                  )}
                  {isEligibleForConvenio(prestamo) && (
                    <button
                      onClick={() => handleConvenioPrestamo(prestamo)}
                      className="bg-accent-copper hover:bg-accent-copper-600 text-neutral-white font-medium text-sm py-1 px-3 rounded-lg shadow-sm"
                    >
                      CONVENIO PRÉSTAMO
                    </button>
                  )}
                  <button
                    onClick={() => handleCancelarPrestamo(prestamo)}
                    className="bg-accent-copper hover:bg-accent-copper-600 text-neutral-dark font-medium text-sm py-1 px-3 rounded-lg shadow-md border border-accent-copper-800"
                  >
                    CANCELAR TOTAL DE PRÉSTAMO
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left font-medium text-neutral-dark border-b border-neutral-gray">
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
                    <tr key={cuota.idCuota} className="border-b border-neutral-gray last:border-b-0 hover:bg-neutral-softWhite">
                      <td className="py-2 px-3">{cuota.numero_cuota}</td>
                      <td className="py-2 px-3">{formatDate(cuota.fecha_vencimiento)}</td>
                      <td className="py-2 px-3">
                        S/ {(parseFloat(cuota.monto) + parseFloat(cuota.excedente_anterior || 0)).toFixed(2)}
                      </td>
                      <td className="py-2 px-3">S/ {parseFloat(cuota.monto_a_pagar).toFixed(2)}</td>
                      <td className="py-2 px-3">S/ {parseFloat(cuota.excedente_anterior || 0).toFixed(2)}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-block py-1 px-2 rounded-full text-xs font-medium
                          ${cuota.estado === 'vencido' ? 'bg-primary-100 text-primary-800' :
                            cuota.estado === 'vence_hoy' ? 'bg-accent-mint-100 text-accent-steel-600' :
                            cuota.estado === 'pagado' ? 'bg-accent-mint text-accent-steel-600' :
                            cuota.estado === 'prepagado' ? 'bg-primary-soft text-primary-800' :
                            'bg-accent-mint-100 text-accent-steel-600'}`}>
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
                          <span className="text-xs text-accent-copper-800 ml-1">(-{cuota.mora_reducida}%)</span>
                        )}
                      </td>
                      <td className="py-2 px-3 flex gap-2">
                        {['pagado', 'prepagado'].includes(cuota.estado) ? (
                          <>
                            {(cuota.modalidad === 'virtual' || (cuota.estado === 'prepagado' && !cuota.modalidad)) && (
                              <button
                                onClick={() => handleVerCaptura(prestamo.prestamo, cuota)}
                                className="bg-primary hover:bg-primary-600 text-neutral-white text-xs py-1 px-2 rounded shadow-sm"
                              >
                                VER CAPTURA
                              </button>
                            )}
                            {cuota.estado === 'pagado' && (
                              <button
                                onClick={() => handleVerComprobante(prestamo.prestamo, cuota)}
                                className="bg-primary-dark hover:bg-primary-800 text-neutral-white text-xs py-1 px-2 rounded shadow-sm"
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
                                  ? 'bg-accent-copper hover:bg-accent-copper-600 text-neutral-white'
                                  : 'bg-neutral-gray text-neutral-dark cursor-not-allowed'
                              }`}
                              disabled={!isCuotaPagable(prestamo, cuota)}
                            >
                              PAGAR
                            </button>
                            {(cuota.estado === 'vencido') && !cuota.reduccion_mora_aplicada && (
                              <button
                                onClick={() => handleReducirMora(prestamo.prestamo, cuota)}
                                className="bg-accent-copper hover:bg-accent-copper-600 text-neutral-white text-xs py-1 px-2 rounded shadow-sm"
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