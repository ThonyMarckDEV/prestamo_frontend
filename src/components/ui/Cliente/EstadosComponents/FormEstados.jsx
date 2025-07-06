// PagoComponent.jsx
import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../../../js/urlHelper';
import { fetchWithAuth } from '../../../../js/authToken';
import { toast } from 'react-toastify';
import LoadingScreen from '../../../Reutilizables/FetchWithGif';
import PrestamosList from './components/PrestamosList';
import PagoCuotaModal from './components/modals/PagoCuotaModal';
import ConfirmationModal from './components/modals/ConfirmationModal';
import CapturaAbonoModal from './components/modals/CapturaAbonoModal';
import jwtUtils from '../../../../utilities/jwtUtils';

export default function PagoComponent() {
  const [loading, setLoading] = useState(false);
  const [cuotasPendientes, setCuotasPendientes] = useState([]);
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [formData, setFormData] = useState({
    idCuota: '',
    monto_pagado: '',
    metodo_pago: 'yape',
    numero_operacion: '',
    observaciones: '',
    capturapago: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showCuotaModal, setShowCuotaModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCapturaAbonoModal, setShowCapturaAbonoModal] = useState(false);
  const [selectedPrestamoId, setSelectedPrestamoId] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [errors, setErrors] = useState({});

  // Get clienteId from JWT token
  useEffect(() => {
    try {
      const token = jwtUtils.getRefreshTokenFromCookie();
      const idUsuario = jwtUtils.getUserID(token);
      if (!idUsuario) {
        throw new Error('No se pudo obtener el ID del cliente desde el token');
      }
      setClienteId(idUsuario);
    } catch (error) {
      console.error('Error obtaining clienteId:', error);
      toast.error('Error al obtener información del cliente. Por favor, inicia sesión nuevamente.');
    }
  }, []);

  // Fetch pending cuotas
  useEffect(() => {
    const fetchCuotasPendientes = async () => {
      if (!clienteId) return;
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/cliente/pagos/cuotas-pendientes`,
          { method: 'GET' }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Error al obtener cuotas pendientes');
        }

        if (!data.success) {
          toast.info(data.message || 'No tienes cuotas pendientes', {
            toastId: 'no-cuotas-pendientes',
          });
          setCuotasPendientes([]);
          return;
        }

        const prestamos = data.data.prestamos || [];
        prestamos.forEach((prestamo) => {
          prestamo.cuotas.forEach((cuota) => {
            if (cuota.mensaje) {
              const toastId = `toast-prestamo-${prestamo.prestamo.idPrestamo}-cuota-${cuota.idCuota}`;
              if (
                cuota.mensaje.includes('Cuota vencida') ||
                cuota.mensaje.includes('Cuota ajustada') ||
                cuota.mensaje.includes('Mora aplicada')
              ) {
                toast.warn(
                  `Préstamo #${prestamo.prestamo.idPrestamo}, Cuota ${cuota.numero_cuota}: ${cuota.mensaje}`,
                  { autoClose: 5000, toastId }
                );
              } else {
                toast.info(
                  `Préstamo #${prestamo.prestamo.idPrestamo}, Cuota ${cuota.numero_cuota}: ${cuota.mensaje}`,
                  { autoClose: 5000, toastId }
                );
              }
            }
          });
        });

        setCuotasPendientes(prestamos);
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Error al obtener cuotas pendientes', {
          toastId: 'error-cuotas-pendientes',
        });
        setCuotasPendientes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCuotasPendientes();
  }, [clienteId]);

  // Handle "Ver Abono" button
  const handleVerCapturaAbono = (prestamo) => {
    if (!clienteId) {
      toast.error('No se pudo identificar al cliente. Intente de nuevo más tarde.');
      return;
    }
    setSelectedPrestamoId(prestamo.prestamo.idPrestamo);
    setShowCapturaAbonoModal(true);
  };

  // Handle paying a cuota
  const handlePagarCuota = (prestamo, cuota) => {
    setSelectedPrestamo(prestamo);
    setSelectedCuota(cuota);
    const montoAPagar = parseFloat(cuota.monto_a_pagar) || parseFloat(cuota.monto) || 0;
    setFormData({
      idCuota: cuota.idCuota,
      monto_pagado: montoAPagar.toFixed(2),
      metodo_pago: 'yape',
      numero_operacion: '',
      observaciones: '',
      capturapago: null,
    });
    setImagePreview(null);
    setShowCuotaModal(true);
  };

  // Validate payment form
  const validatePaymentForm = () => {
    const newErrors = {};

    if (!formData.monto_pagado || parseFloat(formData.monto_pagado) <= 0) {
      newErrors.monto_pagado = 'Monto inválido';
    }
    if (!formData.metodo_pago) {
      newErrors.metodo_pago = 'Seleccione un método de pago';
    }
    if (!formData.capturapago) {
      newErrors.capturapago = 'Debe subir una captura de pantalla';
    }
    if (!formData.numero_operacion.trim()) {
      newErrors.numero_operacion = 'El número de operación es obligatorio';
    } else if (!/^\d+$/.test(formData.numero_operacion.trim())) {
      newErrors.numero_operacion = 'El número de operación debe contener solo números';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Register payment
  const registrarPagoCuota = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('idCuota', formData.idCuota);
      formDataToSend.append('monto_pagado', formData.monto_pagado);
      formDataToSend.append('metodo_pago', formData.metodo_pago);
      formDataToSend.append('numero_operacion', formData.numero_operacion);
      formDataToSend.append('observaciones', formData.observaciones);
      formDataToSend.append('capturapago', formData.capturapago);

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/cliente/pagos/cuota`,
        {
          method: 'POST',
          body: formDataToSend,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el pago');
      }

      toast.success('Pago registrado correctamente, pendiente de aprobación', {
        toastId: `pago-cuota-${formData.idCuota}`,
      });

      setShowCuotaModal(false);
      setShowConfirmationModal(false);

      // Reload pending cuotas
      const cuotasResponse = await fetchWithAuth(
        `${API_BASE_URL}/api/cliente/pagos/cuotas-pendientes`,
        { method: 'GET' }
      );
      const cuotasData = await cuotasResponse.json();
      if (cuotasData.success) {
        setCuotasPendientes(cuotasData.data.prestamos || []);
      } else {
        setCuotasPendientes([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al registrar el pago', {
        toastId: `error-pago-cuota-${formData.idCuota}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (validatePaymentForm()) {
      registrarPagoCuota();
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (name === 'capturapago' && files && files[0]) {
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      capturapago: null,
    }));
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, capturapago: null }));
  };

  return (
    <div className="w-full h-full md:min-h-screen overflow-auto pb-16 bg-gray-100">
      {loading && <LoadingScreen />}

      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 md:p-8 mx-auto w-full max-w-7xl border-t-4 border-red-600">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-red-600 text-center">
          Mis Pagos
        </h2>

        <PrestamosList
          cuotasPendientes={cuotasPendientes}
          handlePagarCuota={handlePagarCuota}
          handleVerCapturaAbono={handleVerCapturaAbono}
        />
      </div>

      <PagoCuotaModal
        show={showCuotaModal}
        onClose={() => {
          setShowCuotaModal(false);
          setImagePreview(null);
        }}
        selectedCuota={selectedCuota}
        selectedPrestamo={selectedPrestamo}
        formData={formData}
        errors={errors}
        imagePreview={imagePreview}
        handleInputChange={handleInputChange}
        handleRemoveImage={handleRemoveImage}
        setShowConfirmationModal={setShowConfirmationModal}
      />

      <ConfirmationModal
        show={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        formData={formData}
        handleConfirm={handleConfirm}
      />

      <CapturaAbonoModal
        show={showCapturaAbonoModal}
        onClose={() => setShowCapturaAbonoModal(false)}
        clienteId={clienteId}
        prestamoId={selectedPrestamoId}
        modalTitle={`Captura de Abono - Préstamo #${selectedPrestamoId || ''}`}
      />
    </div>
  );
}