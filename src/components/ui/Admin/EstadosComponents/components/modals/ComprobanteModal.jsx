import React from 'react';

const ComprobanteModal = ({
  show,
  onClose,
  modalTitle,
  modalContent,
  modalError,
  selectedCuota,
  handleConfirmarPagoPrepagado
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-dark bg-opacity-60">
      <div className="bg-neutral-softWhite rounded-xl w-full max-w-4xl mx-4 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-accent-steel hover:text-accent-steel-600"
          title="Cerrar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-xl font-bold mb-4 text-neutral-dark">
          {modalTitle}
        </h3>
        {modalError ? (
          <div className="p-4 bg-primary-100 border border-primary-soft rounded-lg">
            <p className="text-primary-800 font-medium">{modalError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modalContent.comprobanteUrl ? (
              <div>
                <h4 className="text-sm font-medium text-neutral-dark mb-2">Comprobante de Pago</h4>
                <iframe
                  src={modalContent.comprobanteUrl}
                  title="Comprobante de Pago"
                  className="w-full h-[70vh] border border-neutral-gray rounded-lg shadow-sm"
                />
              </div>
            ) : (
              <div className="p-4 bg-accent-mint-100 border border-accent-mint rounded-lg">
                <p className="text-accent-copper-800 font-medium">No hay comprobante de pago disponible.</p>
              </div>
            )}
          </div>
        )}
        {selectedCuota && selectedCuota.estado === 'prepagado' && !modalError && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleConfirmarPagoPrepagado}
              className="bg-accent-copper hover:bg-accent-copper-600 text-neutral-white font-bold py-2 px-4 rounded-lg shadow-sm"
            >
              Confirmar Pago
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprobanteModal;