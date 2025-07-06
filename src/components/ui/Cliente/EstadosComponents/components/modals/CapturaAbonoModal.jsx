import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../../../../../js/authToken';
import API_BASE_URL from '../../../../../../js/urlHelper';

const CapturaAbonoModal = ({ show, onClose, clienteId, prestamoId, modalTitle }) => {
  const [loading, setLoading] = useState(false);
  const [modalContent, setModalContent] = useState({ capturaUrl: '' });
  const [modalError, setModalError] = useState('');

  // Ensure HTTPS for non-localhost URLs
  const ensureHttpsUrl = (url) => {
    if (!url) return url;
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return url;
    }
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    return url;
  };

  // Normalize image URL for storage
  const normalizeImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Fetch captura abono
  useEffect(() => {
    if (show && clienteId && prestamoId) {
      handleGetCapturaAbono();
    }
  }, [show, clienteId, prestamoId]);

  const handleGetCapturaAbono = async () => {
    setLoading(true);
    setModalError('');
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/captura-abono/${clienteId}/${prestamoId}`,
        { method: 'GET' }
      );
      const data = await response.json();
      if (!response.ok) {
        if (data.message === 'No hay captura de abono disponible') {
          setModalContent({ capturaUrl: '' });
        } else {
          throw new Error(data.message || 'Error al obtener captura de abono');
        }
      } else {
        const capturaUrl = data.captura_url ? ensureHttpsUrl(data.captura_url) : '';
        setModalContent({ capturaUrl });
      }
    } catch (error) {
      console.error('Error fetching captura abono:', error);
      setModalError(error.message || 'Error al obtener captura de abono');
      setModalContent({ capturaUrl: '' });
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setModalContent({ capturaUrl: '' });
    setModalError('');
    onClose();
  };

  return (
    show && (
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 id="modal-title" className="text-xl font-bold text-red-600">
                {modalTitle}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                disabled={loading}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-center items-center mb-4">
                <svg
                  className="animate-spin h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}

            {/* Error Message */}
            {modalError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <strong>Error:</strong> {modalError}
                <button
                  onClick={handleGetCapturaAbono}
                  className="ml-4 text-sm text-blue-600 hover:underline"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Voucher Image or Placeholder */}
            {!loading && !modalError && (
              modalContent.capturaUrl ? (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Voucher de Abono:</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={normalizeImageUrl(modalContent.capturaUrl)}
                      alt="Captura de abono"
                      className="w-full h-auto max-h-96 object-contain bg-gray-50"
                      onError={(e) => {
                        console.error('Error loading image:', modalContent.capturaUrl);
                        e.target.src = '/path/to/fallback-image.png'; // Add fallback image
                        toast.error('No se pudo cargar la imagen');
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    No hay voucher de abono disponible. Vuelve más tarde.
                  </p>
                </div>
              )
            )}

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default CapturaAbonoModal;