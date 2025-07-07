import React from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

const ReducirMoraModal = ({
  show,
  onClose,
  selectedCuota,
  selectedPrestamo,
  formData,
  errors,
  handleInputChange,
  handleConfirmAction,
  formatDate
}) => {
  if (!selectedCuota || !selectedPrestamo) return null;

 return (
    <Modal
      isOpen={show}
      onRequestClose={onClose}
      contentLabel="Reducir Mora de Cuota"
      className="bg-neutral-softWhite rounded-lg p-6 mx-auto max-w-md w-full mt-20 shadow-xl"
      overlayClassName="fixed inset-0 bg-neutral-dark bg-opacity-50 flex items-center justify-center z-50"
    >
      <h2 className="text-lg font-bold mb-4 text-neutral-dark">
        Reducir Mora - Cuota #{selectedCuota.numero_cuota}
      </h2>
      <p className="text-sm text-accent-steel mb-4">
        Préstamo #{selectedPrestamo.idPrestamo} - Fecha de vencimiento: {formatDate(selectedCuota.fecha_vencimiento)}
      </p>
      <p className="text-sm text-accent-steel mb-4">
        Mora actual: S/ {(parseFloat(selectedCuota.mora) || 0).toFixed(2)}
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-dark">
          Porcentaje de Reducción (%)
        </label>
        <input
          type="number"
          name="porcentaje_reduccion"
          value={formData.porcentaje_reduccion || ''}
          onChange={handleInputChange}
          className={`mt-1 block w-full border rounded-md p-2 text-sm ${
            errors.porcentaje_reduccion ? 'border-primary-800' : 'border-neutral-gray'
          } focus:ring-2 focus:ring-primary focus:border-primary`}
          placeholder="Ingrese porcentaje (1-100)"
          min="1"
          max="100"
        />
        {errors.porcentaje_reduccion && (
          <p className="text-primary-800 text-xs mt-1">{errors.porcentaje_reduccion}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="bg-accent-steel hover:bg-accent-steel-600 text-neutral-white font-medium text-sm py-2 px-4 rounded-lg"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmAction}
          className="bg-accent-copper hover:bg-accent-copper-600 text-neutral-white font-medium text-sm py-2 px-4 rounded-lg"
        >
          Aplicar Reducción
        </button>
      </div>
    </Modal>
  );
};

export default ReducirMoraModal;