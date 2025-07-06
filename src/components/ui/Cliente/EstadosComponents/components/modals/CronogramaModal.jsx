import React from 'react';

const CronogramaModal = ({ isOpen, pdfUrl, onClose }) => {
  if (!isOpen || !pdfUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Cronograma de Pagos</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-xl"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <iframe
            src={pdfUrl}
            title="Cronograma de Pagos"
            className="w-full h-[70vh]"
          />
        </div>
      </div>
    </div>
  );
};

export default CronogramaModal;