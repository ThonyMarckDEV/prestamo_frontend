import React from 'react';

const CancelarPrestamoModal = ({
  show,
  onClose,
  selectedPrestamo,
  cancelarForm,
  errors,
  handleInputChange,
  handleConfirmAction
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800">
          Cancelar Préstamo #{selectedPrestamo.idPrestamo}
        </h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">
            Préstamo: #{selectedPrestamo.idPrestamo} - {selectedPrestamo.modalidad}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            Monto pendiente total: S/ {parseFloat(cancelarForm.monto_pagado).toFixed(2)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto a pagar
          </label>
          <input
            type="number"
            name="monto_pagado"
            value={cancelarForm.monto_pagado}
            className={`w-full p-2 border ${errors.monto_pagado ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-100 cursor-not-allowed`}
            step="0.01"
            min={parseFloat(cancelarForm.monto_pagado).toFixed(2)}
            max="999999"
            readOnly
          />
          {errors.monto_pagado && (
            <p className="text-red-500 text-xs mt-1">{errors.monto_pagado}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Operación (opcional)
          </label>
          <input
            type="text"
            name="numero_operacion"
            value={cancelarForm.numero_operacion}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
            maxLength="50"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones (opcional)
          </label>
          <textarea
            name="observaciones"
            value={cancelarForm.observaciones}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
            rows="2"
            maxLength="255"
          ></textarea>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmAction}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cancelar Préstamo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelarPrestamoModal;