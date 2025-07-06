import React from 'react';

const ConfirmationModal = ({
  show,
  onClose,
  confirmationAction,
  formData,
  cancelarForm,
  reprogramarForm,
  convenioForm,
  handleConfirm
}) => {
  if (!show) return null;

  let title = '';
  let message = '';

  switch (confirmationAction) {
    case 'pagar-cuota':
      title = '¿Confirmar pago de cuota?';
      message = `¿Está seguro de registrar el pago de S/ ${parseFloat(formData.monto_pagado).toFixed(2)}?`;
      break;
    case 'reducir-mora':
      title = '¿Confirmar reducción de mora?';
      message = `¿Está seguro de aplicar una reducción de ${formData.porcentaje_reduccion}% a la mora?`;
      break;
    case 'cancelar-prestamo':
      title = '¿Confirmar cancelación del préstamo?';
      message = `¿Está seguro de cancelar el préstamo con un pago de S/ ${parseFloat(cancelarForm.monto_pagado).toFixed(2)}?`;
      break;
    case 'reprogramar-prestamo':
      title = '¿Confirmar reprogramación del préstamo?';
      message = `¿Está seguro de reprogramar el préstamo con una tasa de interés de ${reprogramarForm.tasa_interes}%?`;
      break;
    case 'convenio-prestamo':
      title = '¿Confirmar convenio del préstamo?';
      message = `¿Está seguro de registrar el convenio para el préstamo${convenioForm.solo_capital ? ' (solo capital)' : ''}?`;
      break;
    default:
      title = '¿Confirmar acción?';
      message = '¿Está seguro de realizar esta acción?';
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6 text-center">
        <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            No, Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Sí, Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;