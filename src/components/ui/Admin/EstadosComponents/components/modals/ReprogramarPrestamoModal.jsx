import React from 'react';

const ReprogramarPrestamoModal = ({
  show,
  onClose,
  selectedPrestamo,
  reprogramarForm,
  errors,
  handleInputChange,
  handleConfirmAction
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-dark bg-opacity-50">
      <div className="bg-neutral-softWhite rounded-lg w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold mb-4 text-neutral-dark">
          Reprogramar Préstamo #{selectedPrestamo.idPrestamo}
        </h3>

        <div className="mb-4">
          <p className="text-sm text-accent-steel mb-1">
            Préstamo: #{selectedPrestamo.idPrestamo} - {selectedPrestamo.modalidad}
          </p>
          <p className="text-sm text-accent-steel mb-1">
            Monto: S/ {parseFloat(selectedPrestamo.monto).toFixed(2)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-dark mb-1">
            Tasa de Interés (%)
          </label>
          <input
            type="number"
            name="tasa_interes"
            value={reprogramarForm.tasa_interes}
            onChange={handleInputChange}
            className={`w-full p-2 border ${errors.tasa_interes ? 'border-primary-800' : 'border-neutral-gray'} rounded-lg focus:ring-2 focus:ring-primary focus:border-primary`}
            step="0.1"
            min="1"
            max="5"
          />
          {errors.tasa_interes && (
            <p className="text-primary-800 text-xs mt-1">{errors.tasa_interes}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-dark mb-1">
            Observaciones (opcional)
          </label>
          <textarea
            name="observaciones"
            value={reprogramarForm.observaciones}
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
            className="bg-primary hover:bg-primary-600 text-neutral-white font-bold py-2 px-4 rounded-lg"
          >
            Reprogramar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReprogramarPrestamoModal;