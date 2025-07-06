///////////////////////////////////////////////////////////////
// components/ConfirmationModal.jsx
export default function ConfirmationModal({ action, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3">
      <div className="bg-white p-4 rounded-lg shadow-2xl w-full max-w-xs sm:max-w-md mx-2 border-l-4 border-yellow-500">
        <h3 className="text-lg font-bold mb-2 text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          CONFIRMACIÓN
        </h3>
        <p className="mb-3 text-base">
          ¿ESTÁS SEGURO DE {action === 'guardar' ? 'guardar' : 'cancelar'} LOS DATOS?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium text-sm"
          >
            NO
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 font-medium text-sm"
          >
            SÍ
          </button>
        </div>
      </div>
    </div>
  );
}