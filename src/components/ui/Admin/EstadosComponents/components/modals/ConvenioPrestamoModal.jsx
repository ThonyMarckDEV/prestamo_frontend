import React from 'react';

const ConvenioPrestamoModal = ({
  show,
  onClose,
  selectedPrestamo,
  convenioForm,
  errors,
  handleInputChange,
  handleConfirmAction
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-dark bg-opacity-50">
      <div className="bg-neutral-softWhite rounded-lg w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold mb-4 text-neutral-dark">
          Convenio de Préstamo #{selectedPrestamo.idPrestamo}
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
          <label className="flex items-center">
            <input
              type="checkbox"
              name="solo_capital"
              checked={convenioForm.solo_capital}
              onChange={handleInputChange}
              className="mr-2 accent-primary"
            />
            <span className="text-sm font-medium text-neutral-dark">
              Exonerar intereses (usar solo capital)
            </span>
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-dark mb-1">
            Observaciones (opcional)
          </label>
          <textarea
            name="observaciones"
            value={convenioForm.observaciones}
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
            Registrar Convenio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvenioPrestamoModal;