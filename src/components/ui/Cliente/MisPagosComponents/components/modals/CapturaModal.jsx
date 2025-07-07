// components/modals/CapturaModal.js
import React from 'react';

const CapturaModal = ({ show, onClose, modalTitle, modalContent, modalError }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <div className="bg-white rounded-xl w-full max-w-4xl mx-4 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          title="Cerrar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-xl font-bold mb-4 text-primary">
          {modalTitle}
        </h3>
        {modalError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{modalError}</p>
          </div>
        ) : modalContent ? (
          <img
            src={modalContent}
            alt="Captura de Pago"
            className="w-full max-h-[70vh] object-contain rounded-lg border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">CARGANDO CONTENIDO...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapturaModal;