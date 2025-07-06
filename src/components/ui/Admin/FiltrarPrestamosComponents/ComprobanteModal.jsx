import React from 'react';
import { toast } from 'react-toastify';

const ComprobanteModal = ({
  show,
  onClose,
  modalTitle,
  modalContent,
  modalError,
  selectedCuota,
  handleConfirmarPagoPrepagado,
  loadingComprobante,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <div className="bg-white rounded-xl w-full max-w-4xl mx-4 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          title="Cerrar"
          disabled={loadingComprobante}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-xl font-bold mb-4 text-red-700">{modalTitle}</h3>
        {loadingComprobante ? (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
            <span className="ml-2 text-gray-700">Cargando comprobante...</span>
          </div>
        ) : modalError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{modalError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modalContent.comprobanteUrl ? (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Comprobante de Pago</h4>
                <iframe
                  src={modalContent.comprobanteUrl}
                  title="Comprobante de Pago"
                  className="w-full h-[70vh] border border-gray-200 rounded-lg shadow-sm"
                  onError={() => {
                    console.error('Error loading comprobante PDF:', modalContent.comprobanteUrl);
                    toast.error('No se pudo cargar el comprobante');
                  }}
                />
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium">No hay comprobante de pago disponible.</p>
              </div>
            )}
          </div>
        )}
        {selectedCuota && selectedCuota.estado === 'prepagado' && !modalError && !loadingComprobante && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleConfirmarPagoPrepagado}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm"
              disabled={loadingComprobante}
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