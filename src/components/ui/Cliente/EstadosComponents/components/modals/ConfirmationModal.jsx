// components/modals/ConfirmationModal.js
const ConfirmationModal = ({ show, onClose, formData, handleConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6 text-center shadow-2xl">
        <h3 className="text-lg font-bold mb-4 text-primary">
          Confirmar Pago de Cuota
        </h3>
        
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de registrar el pago de S/ {parseFloat(formData.monto_pagado).toFixed(2)} 
          mediante {formData.metodo_pago.toUpperCase()}?
        </p>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="bg-accent-yellow-400 hover:bg-accent-yellow-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;