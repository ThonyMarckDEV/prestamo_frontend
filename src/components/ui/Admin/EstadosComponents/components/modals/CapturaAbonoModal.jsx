import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../../../../../js/authToken';
import API_BASE_URL from '../../../../../../js/urlHelper';

const CapturaAbonoModal = ({ show, onClose, clienteId, prestamoId, modalTitle }) => {
  const [loading, setLoading] = useState(false);
  const [modalContent, setModalContent] = useState({ capturaUrl: '' });
  const [modalError, setModalError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  // Fetch existing captura abono
  useEffect(() => {
    if (show && clienteId && prestamoId) {
      handleGetCapturaAbono();
    }
    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [show, clienteId, prestamoId]);

  const handleGetCapturaAbono = async () => {
    setLoading(true);
    setModalError(''); // Clear any previous error
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/captura-abono/${clienteId}/${prestamoId}`,
        { method: 'GET' }
      );
      const data = await response.json();
      if (!response.ok) {
        // Only set error for unexpected issues, not for "no captura available"
        if (data.message !== 'No hay captura de abono disponible') {
          throw new Error(data.message || 'Error al obtener captura de abono');
        }
      }

      const capturaUrl = data.captura_url ? ensureHttpsUrl(data.captura_url) : '';
      setModalContent({ capturaUrl });
      setPreviewUrl(normalizeImageUrl(capturaUrl));
    } catch (error) {
      console.error('Error fetching captura abono:', error);
      setModalError(error.message || 'Error al obtener captura de abono');
    } finally {
      setLoading(false);
    }
  };

  // Upload captura abono
  const handleUploadCapturaAbono = async () => {
    if (!selectedFile) {
      toast.error('Por favor, seleccione una imagen');
      return;
    }
    setIsUploading(true);
    setModalError(''); // Clear any previous error
    try {
      const formData = new FormData();
      formData.append('captura', selectedFile);

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/captura-abono/${clienteId}/${prestamoId}`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.errors?.captura?.[0] || 'Error al subir la captura');
      }

      toast.success('Captura de abono subida con éxito');
      setModalContent({ capturaUrl: ensureHttpsUrl(data.captura_url) });
      setPreviewUrl(normalizeImageUrl(data.captura_url));
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading captura abono:', error);
      toast.error(error.message || 'Error al subir la captura');
      setModalError(error.message || 'Error al subir la captura');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete captura abono
  const handleDeleteCapturaAbono = async () => {
    if (!window.confirm('¿Está seguro de que desea eliminar la captura de abono?')) {
      return;
    }

    setIsUploading(true);
    setModalError(''); // Clear any previous error
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/captura-abono/${clienteId}/${prestamoId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar la captura');
      }

      toast.success('Captura de abono eliminada con éxito');
      setModalContent({ capturaUrl: '' });
      setPreviewUrl('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error deleting captura abono:', error);
      toast.error(error.message || 'Error al eliminar la captura');
      setModalError(error.message || 'Error al eliminar la captura');
    } finally {
      setIsUploading(false);
    }
  };

  // File validation
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPEG, PNG o JPG');
      return false;
    }

    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`La imagen es muy grande (${sizeMB}MB). Máximo permitido: 2MB`);
      return false;
    }

    return true;
  };

  // Process file for preview
  const processFile = (file) => {
    if (!validateFile(file)) {
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
    toast.success('Imagen cargada correctamente');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setModalContent({ capturaUrl: '' });
    setModalError('');
    setSelectedFile(null);
    setPreviewUrl('');
    setIsDragging(false);
    setIsUploading(false);
    onClose();
  };

  return (
    show && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">{modalTitle}</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                disabled={isUploading || loading}
              >
                ×
              </button>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <strong>Error:</strong> {modalError}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mb-4 flex justify-center items-center">
                <svg className="animate-spin h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}

            {/* Image Preview - Only show when not loading */}
            {!loading && previewUrl && (
              <div className="mb-4 relative">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {selectedFile ? 'Vista previa de la nueva imagen:' : 'Imagen actual:'}
                </h3>
                <div className="border rounded-lg overflow-hidden relative">
                  <img 
                    src={previewUrl} 
                    alt="Captura de abono" 
                    className="w-full h-auto max-h-96 object-contain bg-gray-50"
                    onError={(e) => {
                      console.error('Error loading image:', previewUrl);
                      e.target.style.display = 'none';
                      toast.error('No se pudo cargar la imagen');
                    }}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* File Upload Area - Only show if no existing capture and not loading */}
            {!loading && !modalContent.capturaUrl && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar imagen:
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-500">
                          Haga clic para seleccionar
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                      </label>
                      <p className="text-xs text-gray-500">o arrastre y suelte aquí</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG hasta 2MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* File Info */}
            {!loading && selectedFile && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  <strong>Archivo seleccionado:</strong> {selectedFile.name}
                </p>
                <p className="text-sm text-green-600">
                  Tamaño: {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {!loading && (
              <div className="flex flex-wrap gap-3 justify-end">
                {modalContent.capturaUrl ? (
                  <button
                    onClick={handleDeleteCapturaAbono}
                    disabled={isUploading}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Eliminar Imagen
                  </button>
                ) : (
                  selectedFile && (
                    <button
                      onClick={handleUploadCapturaAbono}
                      disabled={isUploading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Subiendo...
                        </>
                      ) : (
                        'Subir Imagen'
                      )}
                    </button>
                  )
                )}
                <button
                  onClick={handleClose}
                  disabled={isUploading || loading}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default CapturaAbonoModal;