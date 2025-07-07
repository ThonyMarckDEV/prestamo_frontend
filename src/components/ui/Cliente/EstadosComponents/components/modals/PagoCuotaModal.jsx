import { useState } from 'react';
import { formatDate } from '../utils/formatDate';
import qrimage from '../../../../../../img/ThonyMarckQR.jpg';

const PagoCuotaModal = ({
  show,
  onClose,
  selectedCuota,
  selectedPrestamo,
  formData,
  errors,
  imagePreview,
  handleInputChange,
  handleRemoveImage,
  setShowConfirmationModal
}) => {
  const [showImageModal, setShowImageModal] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <div className="bg-white rounded-xl w-11/12 sm:max-w-lg md:max-w-4xl mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-primary">
          Pagar Cuota #{selectedCuota.numero_cuota}
        </h3>

        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Préstamo:</span> #{selectedPrestamo.idPrestamo} - {selectedPrestamo.modalidad}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Monto a pagar:</span> S/ {parseFloat(selectedCuota.monto_a_pagar).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Fecha de vencimiento:</span> {formatDate(selectedCuota.fecha_vencimiento)}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Left Column: Payment Method and Instructions */}
          <div className="w-full md:w-1/2">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Método de Pago
              </label>
              <select
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-colors ${errors.metodo_pago ? 'border-primary-100' : 'border-gray-300'}`}
              >
                <option value="yape">Yape</option>
                <option value="deposito">Depósito Bancario</option>
              </select>
              {errors.metodo_pago && (
                <p className="text-red-500 text-xs mt-1">{errors.metodo_pago}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Instrucciones de Pago
              </label>
              {formData.metodo_pago === 'yape' && (
                <div className="text-center">
                  <img
                    src={qrimage}
                    alt="QR Yape"
                    className="mx-auto w-32 h-32 sm:w-40 sm:h-40 mb-2 rounded-lg shadow-sm"
                  />
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {`Escanea el código QR con Yape para pagar S/ ${parseFloat(selectedCuota.monto_a_pagar).toFixed(2)}\nNúmero: 938176381\nCORPORACIÓN E INVERSIONES SULLANA LA PERLA DEL CHIRA S.A.C`}
                  </p>
                </div>
              )}
              {formData.metodo_pago === 'deposito' && (
                <div className="text-center bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {`Realiza el pago al siguiente número de cuenta:\nBCP: 5357079899068\nMonto: S/ ${parseFloat(selectedCuota.monto_a_pagar).toFixed(2)}\n CORPORACIÓN E INVERSIONES SULLANA LA PERLA DEL CHIRA S.A.C`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Image Upload and Optional Fields */}
          <div className="w-full md:w-1/2">
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ADVERTENCIA: La presentación de capturas falsas o que no correspondan al pago puede resultar en acciones legales. Por favor, verifique que la captura de pantalla sea válida.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Captura de Pantalla del Pago
              </label>
              {!imagePreview ? (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-4 pb-5">
                      <svg className="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V8m0 0l-3 3m3-3l3 3m6-9v12m0 0l-3-3m3 3l3-3"></path>
                      </svg>
                      <p className="text-xs text-gray-500">Subir captura (JPG, JPEG, PNG)</p>
                    </div>
                    <input
                      type="file"
                      name="capturapago"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Vista previa de la captura"
                    className="w-full h-32 sm:h-40 object-contain rounded-lg border border-gray-200 shadow-sm cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors"
                    title="Eliminar imagen"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                  <p className="text-xs text-gray-500 italic text-center mt-1">
                    Haz clic en la imagen para verla completa
                  </p>
                </div>
              )}
              {errors.capturapago && (
                <p className="text-red-500 text-xs mt-1">{errors.capturapago}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Número de Operación
              </label>
              <input
                type="text"
                name="numero_operacion"
                value={formData.numero_operacion}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-600 transition-colors ${errors.numero_operacion ? 'border-red-500' : 'border-gray-300'}`}
                maxLength="50"
                placeholder="Ingrese el número de operación"
                required
                pattern="\d*"
                title="Solo se permiten números"
              />
              {errors.numero_operacion && (
                <p className="text-red-500 text-xs mt-1">{errors.numero_operacion}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Observaciones (Opcional)
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-600 transition-colors border-gray-300"
                rows="2"
                maxLength="255"
                placeholder="Ingrese cualquier observación adicional"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-1.5 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => setShowConfirmationModal(true)}
            className="bg-primary-light hover:bg-primary-dark text-white font-medium py-1.5 px-4 rounded-lg transition-colors"
          >
            Confirmar Pago
          </button>
        </div>
      </div>

      {/* Mini Modal for Enlarged Image */}
      {showImageModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black bg-opacity-75">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-11/12 max-w-md sm:max-w-lg md:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 bg-white rounded-full p-1.5 shadow-sm"
              title="Cerrar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-base font-semibold mb-3 text-gray-800">Vista Previa de Captura</h3>
            <img
              src={imagePreview}
              alt="Captura de Pago Ampliada"
              className="w-full max-h-[70vh] object-contain rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PagoCuotaModal;