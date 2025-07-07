import React, { useState, useEffect } from 'react';

const PagoCuotaModal = ({
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
  const [localErrors, setLocalErrors] = useState({});

  // Validate monto_pagado
  const validateMontoPagado = (value) => {
    if (!show || !selectedCuota) return null; // Skip validation if modal is not shown
    const montoAPagar = parseFloat(selectedCuota.monto_a_pagar);
    const montoPagado = parseFloat(value);

    if (isNaN(montoPagado) || montoPagado <= 0) {
      return 'El monto pagado debe ser un número positivo';
    }
    if (montoPagado < montoAPagar) {
      return `El monto pagado debe ser mayor o igual a S/ ${montoAPagar.toFixed(2)}`;
    }
    return null;
  };

  // Validate numero_operacion
  const validateNumeroOperacion = (value) => {
    if (!show) return null; // Skip validation if modal is not shown
    if (!value.trim()) {
      return 'El número de operación es obligatorio';
    }
    if (!/^\d+$/.test(value)) {
      return 'Solo se permiten números';
    }
    return null;
  };

  // Update local errors when formData changes
  useEffect(() => {
    if (!show) return; // Skip effect logic if modal is not shown
    setLocalErrors((prev) => ({
      ...prev,
      monto_pagado: validateMontoPagado(formData.monto_pagado),
      numero_operacion: validateNumeroOperacion(formData.numero_operacion)
    }));
  }, [show, formData.monto_pagado, formData.numero_operacion, selectedCuota?.monto_a_pagar]);

  // Handle input changes with local validation
  const handleLocalInputChange = (e) => {
    const { name, value } = e.target;
    handleInputChange(e); // Call parent handler to update formData

    if (name === 'monto_pagado') {
      const error = validateMontoPagado(value);
      setLocalErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    } else if (name === 'numero_operacion') {
      const error = validateNumeroOperacion(value);
      setLocalErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Check if form is valid
  const isFormValid = !localErrors.monto_pagado && !localErrors.numero_operacion;

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-dark bg-opacity-50">
      <div className="bg-neutral-softWhite rounded-lg w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold mb-4 text-neutral-dark">
          Registrar Pago de Cuota #{selectedCuota.numero_cuota}
        </h3>

        <div className="mb-4">
          <p className="text-sm text-accent-steel mb-1">
            Préstamo: #{selectedPrestamo.idPrestamo} - {selectedPrestamo.modalidad}
          </p>
          <p className="text-sm text-accent-steel mb-1">
            Monto: S/ {(parseFloat(selectedCuota.monto) + parseFloat(selectedCuota.excedente_anterior || 0)).toFixed(2)}
          </p>
          <p className="text-sm text-accent-steel mb-1">
            Excedente anterior: S/ {parseFloat(selectedCuota.excedente_anterior || 0).toFixed(2)}
          </p>
          <p className="text-sm text-accent-steel mb-1">
            Monto a pagar: S/ {parseFloat(selectedCuota.monto_a_pagar).toFixed(2)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-dark mb-1">
            Monto a pagar
          </label>
          <input
            type="number"
            name="monto_pagado"
            value={formData.monto_pagado}
            onChange={handleLocalInputChange}
            className={`w-full p-2 border ${errors.monto_pagado ? 'border-primary-800' : 'border-neutral-gray'} rounded-lg focus:ring-2 focus:ring-primary focus:border-primary`}
            step="0.01"
            min="0.01"
            max="999999"
            required
          />
          {errors.monto_pagado && (
            <p className="text-primary-800 text-xs mt-1">{errors.monto_pagado}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-dark mb-1">
            Número de Operación
          </label>
          <input
            type="text"
            name="numero_operacion"
            value={formData.numero_operacion}
            onChange={handleLocalInputChange}
            className={`w-full p-2 border ${errors.numero_operacion ? 'border-primary-800' : 'border-neutral-gray'} rounded-lg focus:ring-2 focus:ring-primary focus:border-primary`}
            maxLength="50"
            required
            pattern="\d*"
            title="Solo se permiten números"
          />
          {errors.numero_operacion && (
            <p className="text-primary-800 text-xs mt-1">{errors.numero_operacion}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-dark mb-1">
            Observaciones (opcional)
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleLocalInputChange}
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
            className={`bg-accent-copper hover:bg-accent-copper-600 text-neutral-white font-bold py-2 px-4 rounded-lg ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isFormValid}
          >
            Registrar Pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoCuotaModal;