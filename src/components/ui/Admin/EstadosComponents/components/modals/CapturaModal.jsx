import React, { useState } from 'react';
import { toast } from 'react-toastify';

const CapturaModal = ({
  show,
  onClose,
  modalTitle,
  modalContent,
  modalError,
  selectedCuota,
  handleConfirmarPagoPrepagado,
  handleRechazarPagoPrepagado,
  selectedCliente,
  selectedPrestamo,
}) => {
  const [motivo, setMotivo] = useState('Comprobante equivocado'); // Default reason
  const [customMotivo, setCustomMotivo] = useState('');
  const [useCustomMotivo, setUseCustomMotivo] = useState(false);

  if (!show) return null;

  const genericMotivos = [
    'Comprobante equivocado',
    'Monto incorrecto',
    'Fecha de pago inválida',
    'Comprobante ilegible',
    'Otro',
  ];

  const handleRechazar = async () => {
    // Validate required fields
    if (!selectedCuota) {
      toast.error('No se ha seleccionado una cuota');
      return;
    }
    if (!selectedCliente) {
      toast.error('No se ha seleccionado un cliente');
      return;
    }
    if (!selectedPrestamo) {
      toast.error('No se ha seleccionado un préstamo');
      return;
    }

    // Determine final motivo
    let finalMotivo = motivo.trim();
    if (useCustomMotivo) {
      finalMotivo = customMotivo.trim();
      if (!finalMotivo) {
        toast.error('El motivo personalizado no puede estar vacío');
        return;
      }
    } else {
      // Ensure generic motivo is valid
      if (!genericMotivos.includes(finalMotivo)) {
        toast.error('Por favor, seleccione un motivo válido');
        return;
      }
    }

    try {
      await handleRechazarPagoPrepagado({
        idCliente: selectedCliente.idUsuario,
        idPrestamo: selectedPrestamo.idPrestamo,
        idCuota: selectedCuota.idCuota,
        motivo: finalMotivo,
      });
      onClose();
    } catch (error) {
      toast.error(error.message || 'Error al rechazar el pago');
    }
  };
return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-dark bg-opacity-60">
      <div className="bg-neutral-softWhite rounded-xl w-full max-w-4xl mx-4 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-accent-steel hover:text-accent-steel-600"
          title="Cerrar"
          aria-label="Cerrar modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-xl font-bold mb-4 text-neutral-dark">{modalTitle}</h3>
        {modalError ? (
          <div className="p-4 bg-primary-100 border border-primary-soft rounded-lg">
            <p className="text-primary-800 font-medium">{modalError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modalContent.capturaUrl ? (
              <div>
                <h4 className="text-sm font-medium text-neutral-dark mb-2">Captura de Pago</h4>
                <img
                  src={modalContent.capturaUrl}
                  alt="Captura de Pago"
                  className="w-full max-h-[70vh] object-contain rounded-lg border border-neutral-gray shadow-sm"
                />
              </div>
            ) : (
              <div className="p-4 bg-accent-mint-100 border border-accent-mint rounded-lg">
                <p className="text-accent-copper-800 font-medium">No hay captura de pago disponible.</p>
              </div>
            )}
          </div>
        )}
        {selectedCuota && selectedCuota.estado === 'prepagado' && !modalError && (
          <div className="mt-4">
            <div className="mb-4">
              <label htmlFor="motivo" className="block text-sm font-medium text-neutral-dark mb-1">
                Motivo de Rechazo
              </label>
              <select
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                disabled={useCustomMotivo}
                className="w-full p-2 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {genericMotivos.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="customMotivo"
                checked={useCustomMotivo}
                onChange={(e) => setUseCustomMotivo(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-gray rounded"
              />
              <label htmlFor="customMotivo" className="ml-2 text-sm text-neutral-dark">
                Especificar motivo personalizado
              </label>
            </div>
            {useCustomMotivo && (
              <div className="mb-4">
                <label htmlFor="customMotivoText" className="block text-sm font-medium text-neutral-dark mb-1">
                  Motivo Personalizado
                </label>
                <textarea
                  id="customMotivoText"
                  value={customMotivo}
                  onChange={(e) => setCustomMotivo(e.target.value)}
                  className="w-full p-2 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  rows="4"
                  placeholder="Escriba el motivo del rechazo..."
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleConfirmarPagoPrepagado}
                className="bg-accent-copper hover:bg-accent-copper-600 text-neutral-white font-bold py-2 px-4 rounded-lg shadow-sm"
                aria-label="Confirmar pago prepagado"
              >
                Confirmar Pago
              </button>
              <button
                onClick={handleRechazar}
                className="bg-primary hover:bg-primary-600 text-neutral-white font-bold py-2 px-4 rounded-lg shadow-sm"
                aria-label="Rechazar pago prepagado"
              >
                Rechazar Pago
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapturaModal;