// MisPagos.js
import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../../../js/urlHelper';
import { fetchWithAuth } from '../../../../js/authToken';
import { toast } from 'react-toastify';
import LoadingScreen from '../../../Reutilizables/FetchWithGif';
import PrestamoSelector from './components/PrestamoSelector';
import CuotasPagadasList from './components/CuotasPagadasList';
import CapturaModal from './components/modals/CapturaModal';
import ComprobanteModal from './components/modals/ComprobanteModal';

export default function MisPagos() {
  const [loading, setLoading] = useState(false);
  const [prestamos, setPrestamos] = useState([]);
  const [selectedPrestamoId, setSelectedPrestamoId] = useState(null);
  const [cuotasPagadas, setCuotasPagadas] = useState([]);
  const [showCapturaModal, setShowCapturaModal] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalError, setModalError] = useState(null);

  // Utility function to ensure HTTPS URLs
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
  
  // Cargar préstamos al montar el componente
  useEffect(() => {
    const fetchPrestamos = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/cliente/pagos/prestamos-cuotas-pagadas`,
          { method: 'GET' }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Error al obtener préstamos');
        }

        if (!data.success) {
          toast.info(data.message || 'No tienes préstamos activos', {
            toastId: 'no-prestamos'
          });
          setPrestamos([]);
          return;
        }

        const prestamosData = data.data.prestamos || [];
        setPrestamos(prestamosData);

        // Seleccionar el primer préstamo por defecto si existe
        if (prestamosData.length > 0) {
          setSelectedPrestamoId(prestamosData[0].prestamo.idPrestamo);
          setCuotasPagadas(prestamosData[0].cuotas || []);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Error al obtener préstamos', {
          toastId: 'error-prestamos'
        });
        setPrestamos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestamos();
  }, []);

  // Manejar selección de préstamo
  const handleSelectPrestamo = (prestamoId) => {
    setSelectedPrestamoId(prestamoId);
    const selectedPrestamo = prestamos.find(p => p.prestamo.idPrestamo === prestamoId);
    setCuotasPagadas(selectedPrestamo ? selectedPrestamo.cuotas : []);
  };

  // Obtener captura de pago
  const handleViewCaptura = async (idCuota) => {
    setLoading(true);
    setModalError(null);
    setModalTitle('Captura de Pago');
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/cliente/pagos/captura-pago/${idCuota}`,
        { method: 'GET' }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener la captura de pago');
      }

      if (data.success && data.capturapago_url) {
        const capturapagoUrl = ensureHttpsUrl(`${data.capturapago_url.replace(/^\/+/, '')}`);
        setModalContent(capturapagoUrl);
        setShowCapturaModal(true);
      } else {
        setModalError('Captura de pago no disponible');
        setShowCapturaModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setModalError(error.message || 'Error al obtener la captura de pago');
      setShowCapturaModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Obtener comprobante de pago
  const handleViewComprobante = async (idCuota) => {
    setLoading(true);
    setModalError(null);
    setModalTitle('Comprobante de Pago');
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/cliente/pagos/comprobante-pago/${idCuota}`,
        { method: 'GET' }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener el comprobante de pago');
      }

      if (data.success && data.comprobante_url) {
        const comprobanteUrl = ensureHttpsUrl(`${data.comprobante_url.replace(/^\/+/, '')}`);
        setModalContent(comprobanteUrl);
        setShowComprobanteModal(true);
      } else {
        setModalError('Comprobante de pago no disponible');
        setShowComprobanteModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setModalError(error.message || 'Error al obtener el comprobante de pago');
      setShowComprobanteModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full md:min-h-screen overflow-auto pb-16 bg-gray-100">
      {loading && <LoadingScreen />}
      
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 md:p-8 mx-auto w-full max-w-7xl border-t-4 border-red-600">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-red-600 text-center">
          MIS PAGOS
        </h2>

        <PrestamoSelector 
          prestamos={prestamos} 
          selectedPrestamoId={selectedPrestamoId} 
          onSelectPrestamo={handleSelectPrestamo} 
        />

        <CuotasPagadasList 
          selectedPrestamoId={selectedPrestamoId}
          cuotasPagadas={cuotasPagadas}
          onViewCaptura={handleViewCaptura}
          onViewComprobante={handleViewComprobante}
        />

        <CapturaModal
          show={showCapturaModal}
          onClose={() => setShowCapturaModal(false)}
          modalTitle={modalTitle}
          modalContent={modalContent}
          modalError={modalError}
        />

        <ComprobanteModal
          show={showComprobanteModal}
          onClose={() => setShowComprobanteModal(false)}
          modalTitle={modalTitle}
          modalContent={modalContent}
          modalError={modalError}
        />
      </div>
    </div>
  );
}