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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-dark bg-opacity-50">
      <div className="bg-neutral-softWhite rounded-lg w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold mb-4 text-neutral-dark">
          Cancelar Préstamo #{selectedPrestamo.idPrestamo}
        </h3>

        <div className="mb-4">
          <p className="text-sm text-accent-steel mb-1">
            Préstamo: #{selectedPrestamo.idPrestamo} - {selectedPrestamo.modalidad}
          </p>
          <p className="text-sm text-accent-steel mb-1">
            Monto pendiente total: S/ {parseFloat(cancelarForm.monto_pagado).toFixed(2)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-dark mb-1">
            Monto a pagar
          </label>
          <input
            type="number"
            name="monto_pagado"
            value={cancelarForm.monto_pagado}
            className={`w-full p-2 border ${errors.monto_pagado ? 'border-primary-800' : 'border-neutral-gray'} rounded-lg bg-neutral-gray bg-opacity-20 cursor-not-allowed`}
            step="0.01"
            min={parseFloat(cancelarForm.monto_pagado).toFixed(2)}
            max="999999"
            readOnly
          />
          {errors.monto_pagado && (
            <p className="text-primary-800 text-xs mt-1">{errors.monto_pagado}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-dark mb-1">
            Número de Operación (opcional)
          </label>
          <input
            type="text"
            name="numero_operacion"
            value={cancelarForm.numero_operacion}
            onChange={handleInputChange}
            className="w-full p-2 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            maxLength="50"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-dark mb-1">
            Observaciones (opcional)
          </label>
          <textarea
            name="observaciones"
            value={cancelarForm.observaciones}
            onChange={handleInputChange}
            className="w-full p-2 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            rows="2"
            maxLength="255"
          ></textarea>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-accent-steel hover:bg-accent-steel-600 text-neutral-white font-bold py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmAction}
            className="bg-accent-copper hover:bg-accent-copper-600 text-neutral-white font-bold py-2 px-4 rounded-lg"
          >
            Cancelar Préstamo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelarPrestamoModal;