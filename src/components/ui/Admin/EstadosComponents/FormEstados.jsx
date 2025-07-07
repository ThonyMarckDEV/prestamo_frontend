import React, { useState } from 'react';
import API_BASE_URL from '../../../../js/urlHelper';
import { fetchWithAuth } from '../../../../js/authToken';
import { toast } from 'react-toastify';
import LoadingScreen from '../../../Reutilizables/FetchWithGif';
import ClienteSearch from './components/ClienteSearch';
import PrestamosList from './components/PrestamosList';
import PagoCuotaModal from './components/modals/PagoCuotaModal';
import CapturaModal from './components/modals/CapturaModal';
import ComprobanteModal from './components/modals/ComprobanteModal';
import CancelarPrestamoModal from './components/modals/CancelarPrestamoModal';
import ReprogramarPrestamoModal from './components/modals/ReprogramarPrestamoModal';
import ConvenioPrestamoModal from './components/modals/ConvenioPrestamoModal';
import ConfirmationModal from './components/modals/ConfirmationModal';
import CapturaAbonoModal from './components/modals/CapturaAbonoModal';
import ReducirMoraModal from './components/modals/ReducirMoraModal';
import { format, parseISO } from 'date-fns';

export default function PagoComponent() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [cuotasPendientes, setCuotasPendientes] = useState([]);
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [formData, setFormData] = useState({
    idCuota: '',
    idCliente: '',
    monto_pagado: '',
    numero_operacion: '',
    observaciones: '',
    porcentaje_reduccion: ''
  });
  const [cancelarForm, setCancelarForm] = useState({
    idPrestamo: '',
    idCliente: '',
    monto_pagado: '',
    numero_operacion: '',
    observaciones: ''
  });
  const [reprogramarForm, setReprogramarForm] = useState({
    idPrestamo: '',
    tasa_interes: '1',
    observaciones: ''
  });
  const [convenioForm, setConvenioForm] = useState({
    idPrestamo: '',
    solo_capital: false,
    observaciones: ''
  });
  const [showCuotaModal, setShowCuotaModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [showReprogramarModal, setShowReprogramarModal] = useState(false);
  const [showConvenioModal, setShowConvenioModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCapturaModal, setShowCapturaModal] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [modalContent, setModalContent] = useState({ capturaUrl: '', comprobanteUrl: '' });
  const [modalTitle, setModalTitle] = useState('');
  const [modalError, setModalError] = useState('');
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [errors, setErrors] = useState({});
  const [showCapturaAbonoModal, setShowCapturaAbonoModal] = useState(false);
  const [showReducirMoraModal, setShowReducirMoraModal] = useState(false);

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

  const handleSubirCapturaAbono = (prestamo) => {
    setSelectedPrestamo(prestamo.prestamo);
    setShowCapturaAbonoModal(true);
  };

  const handleReducirMora = (prestamo, cuota) => {
    setSelectedPrestamo(prestamo);
    setSelectedCuota(cuota);
    setFormData({
      idCuota: cuota.idCuota,
      idCliente: selectedCliente.idUsuario,
      porcentaje_reduccion: ''
    });
    setShowReducirMoraModal(true);
  };

  const validateReducirMoraForm = () => {
    const newErrors = {};
    if (!formData.porcentaje_reduccion || parseFloat(formData.porcentaje_reduccion) < 1 || parseFloat(formData.porcentaje_reduccion) > 100) {
      newErrors.porcentaje_reduccion = 'El porcentaje de reducción debe estar entre 1% y 100%';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Ingrese un criterio de búsqueda');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/pagos/buscar-clientes?query=${encodeURIComponent(searchQuery)}`,
        { method: 'GET' }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al buscar clientes');
      }

      setSearchResults(data.data || []);
      if (data.data && data.data.length === 0) {
        toast.info('No se encontraron clientes con ese criterio');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al buscar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCliente = async (cliente) => {
    setSelectedCliente(cliente);
    setSearchResults([]);
    setSearchQuery(`${cliente.nombre} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno} - ${cliente.dni}`);
    setLoading(true);

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/pagos/cuotas-pendientes/${cliente.idUsuario}`,
        { method: 'GET' }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener cuotas pendientes');
      }

      if (!data.success) {
        toast.info(data.message || 'El cliente no tiene cuotas pendientes');
        setCuotasPendientes([]);
        return;
      }

      const prestamos = data.data.prestamos || [];
      prestamos.forEach((prestamo, index) => {
        prestamo.cuotas.forEach((cuota) => {
          if (cuota.mensaje) {
            if (
              cuota.mensaje.includes('Cuota vencida') ||
              cuota.mensaje.includes('Cuota ajustada') ||
              cuota.mensaje.includes('Mora aplicada')
            ) {
              toast.warn(
                `Préstamo ${index + 1}, Cuota ${cuota.numero_cuota}: ${cuota.mensaje}`,
                { autoClose: 5000 }
              );
            } else {
              toast.info(
                `Préstamo ${index + 1}, Cuota ${cuota.numero_cuota}: ${cuota.mensaje}`,
                { autoClose: 5000 }
              );
            }
          }
        });
      });

      setCuotasPendientes(prestamos);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al obtener cuotas pendientes');
      setCuotasPendientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePagarCuota = (prestamo, cuota) => {
    setSelectedPrestamo(prestamo);
    setSelectedCuota(cuota);
    const montoAPagar = parseFloat(cuota.monto_a_pagar) || parseFloat(cuota.monto) || 0;
    setFormData({
      idCuota: cuota.idCuota,
      idCliente: selectedCliente.idUsuario,
      monto_pagado: montoAPagar.toFixed(2),
      numero_operacion: '',
      observaciones: ''
    });
    setShowCuotaModal(true);
  };

  const handleVerCaptura = async (prestamo, cuota) => {
    setSelectedPrestamo(prestamo);
    setSelectedCuota(cuota);
    setLoading(true);
    setModalContent({ capturaUrl: '', comprobanteUrl: '' });
    setModalError('');
    setModalTitle(`Captura de Pago - Cuota #${cuota.numero_cuota}`);

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/pagos/captura/${cuota.idCuota}`,
        { method: 'GET' }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener captura de pago');
      }

      const capturaUrl = data.capturapago_url ? ensureHttpsUrl(data.capturapago_url) : '';
      if (!capturaUrl) {
        throw new Error('No hay captura de pago disponible');
      }

      setModalContent({ capturaUrl, comprobanteUrl: '' });
      setShowCapturaModal(true);
    } catch (error) {
      console.error('Error:', error);
      setModalError(error.message || 'Error al obtener captura de pago');
      setShowCapturaModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerComprobante = async (prestamo, cuota) => {
    setSelectedPrestamo(prestamo);
    setSelectedCuota(cuota);
    setLoading(true);
    setModalContent({ capturaUrl: '', comprobanteUrl: '' });
    setModalError('');
    setModalTitle(`Comprobante de Pago - Cuota #${cuota.numero_cuota}`);

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/pagos/comprobante/${cuota.idCuota}`,
        { method: 'GET' }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener comprobante de pago');
      }

      const comprobanteUrl = data.comprobante_url ? ensureHttpsUrl(data.comprobante_url) : '';
      if (!comprobanteUrl) {
        throw new Error('No hay comprobante de pago disponible');
      }

      setModalContent({ capturaUrl: '', comprobanteUrl });
      setShowComprobanteModal(true);
    } catch (error) {
      console.error('Error:', error);
      setModalError(error.message || 'Error al obtener comprobante de pago');
      setShowComprobanteModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarPrestamo = (prestamo) => {
    const montoPendiente = prestamo.cuotas
      .filter(cuota => !['pagado', 'prepagado'].includes(cuota.estado))
      .reduce((total, cuota) => total + parseFloat(cuota.monto_a_pagar || cuota.monto || 0), 0);
    setSelectedPrestamo(prestamo.prestamo);
    setCancelarForm({
      idPrestamo: prestamo.prestamo.idPrestamo,
      idCliente: selectedCliente.idUsuario,
      monto_pagado: montoPendiente.toFixed(2),
      numero_operacion: '',
      observaciones: ''
    });
    setShowCancelarModal(true);
  };

  const handleReprogramarPrestamo = (prestamo) => {
    setSelectedPrestamo(prestamo.prestamo);
    setReprogramarForm({
      idPrestamo: prestamo.prestamo.idPrestamo,
      tasa_interes: '1',
      observaciones: ''
    });
    setShowReprogramarModal(true);
  };

  const handleConvenioPrestamo = (prestamo) => {
    setSelectedPrestamo(prestamo.prestamo);
    setConvenioForm({
      idPrestamo: prestamo.prestamo.idPrestamo,
      solo_capital: false,
      observaciones: ''
    });
    setShowConvenioModal(true);
  };

  const handleRechazarPagoPrepagado = async ({ idCliente, idPrestamo, idCuota, motivo }) => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/pagos/rechazar-prepago/${idCuota}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idCliente, idPrestamo, idCuota, motivo })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al rechazar el pago');
      }

      toast.success('Pago rechazado correctamente');
      // Refresh cuotas list
      if (selectedCliente) {
        await handleSelectCliente(selectedCliente);
      }
    } catch (error) {
      console.error('Error:', error);
      throw error; // Propagate error to CapturaModal
    } finally {
      setLoading(false);
    }
  };

  const validatePaymentForm = () => {
    const newErrors = {};
    if (!formData.monto_pagado || parseFloat(formData.monto_pagado) <= 0) {
      newErrors.monto_pagado = 'Ingrese un monto válido';
    }
    if (!formData.idCliente) {
      newErrors.idCliente = 'Cliente no seleccionado';
    }
    if (!formData.numero_operacion.trim()) {
      newErrors.numero_operacion = 'El número de operación es obligatorio';
    } else if (!/^\d+$/.test(formData.numero_operacion.trim())) {
      newErrors.numero_operacion = 'El número de operación debe contener solo números';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCancelForm = () => {
    const newErrors = {};
    if (!cancelarForm.monto_pagado || parseFloat(cancelarForm.monto_pagado) <= 0) {
      newErrors.monto_pagado = 'Ingrese un monto válido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateReprogramarForm = () => {
    const newErrors = {};
    if (!reprogramarForm.tasa_interes || parseFloat(reprogramarForm.tasa_interes) < 1 || parseFloat(reprogramarForm.tasa_interes) > 5) {
      newErrors.tasa_interes = 'La tasa de interés debe estar entre 1% y 5%';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateConvenioForm = () => {
    const newErrors = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmAction = (action) => {
    let isValid = false;
    if (action === 'pagar-cuota') {
      isValid = validatePaymentForm();
    } else if (action === 'reducir-mora') {
      isValid = validateReducirMoraForm();
    } else if (action === 'cancelar-prestamo') {
      isValid = validateCancelForm();
    } else if (action === 'reprogramar-prestamo') {
      isValid = validateReprogramarForm();
    } else if (action === 'convenio-prestamo') {
      isValid = validateConvenioForm();
    }
    if (isValid) {
      setConfirmationAction(action);
      setShowConfirmationModal(true);
    }
  };

  const registrarReducirMora = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/pagos/reducir-mora`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idCuota: formData.idCuota,
            porcentaje_reduccion: parseFloat(formData.porcentaje_reduccion)
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al aplicar la reducción de mora');
      }
      toast.success('Reducción de mora aplicada correctamente');
      setShowReducirMoraModal(false);
      setShowConfirmationModal(false);
      if (selectedCliente) {
        await handleSelectCliente(selectedCliente);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al aplicar la reducción de mora');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarPagoPrepagado = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/pagos/confirmar-prepago/${selectedCuota.idCuota}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al confirmar el pago');
      }

      toast.success('Pago confirmado correctamente');

      setSelectedCuota({ ...selectedCuota, estado: 'pagado' });

      setShowCapturaModal(false);
      setModalContent({ capturaUrl: '', comprobanteUrl: '' });
      setModalTitle('');
      setModalError('');

      if (data.data && data.data.comprobante_url) {
        const comprobanteUrl = ensureHttpsUrl(data.data.comprobante_url);
        setModalContent({ capturaUrl: '', comprobanteUrl });
        setModalTitle(`Comprobante de Pago - Cuota #${selectedCuota.numero_cuota}`);
        setModalError('');
        setShowComprobanteModal(true);
      }

      if (selectedCliente) {
        await handleSelectCliente(selectedCliente);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al confirmar el pago');
      setModalError(error.message || 'Error al confirmar el pago');
    } finally {
      setLoading(false);
    }
  };

  const registrarPagoCuota = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/pagos/cuota`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al registrar el pago');
      }

      toast.success('Pago registrado correctamente');
      if (data.data && data.data.comprobante_url) {
        const comprobanteUrl = ensureHttpsUrl(data.data.comprobante_url);
        setModalContent({ capturaUrl: '', comprobanteUrl });
        setModalTitle(`Comprobante de Pago - Cuota #${selectedCuota.numero_cuota}`);
        setModalError('');
        setShowComprobanteModal(true);
      }

      setShowCuotaModal(false);
      setShowConfirmationModal(false);
      if (selectedCliente) {
        await handleSelectCliente(selectedCliente);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const registrarCancelacionPrestamo = async () => {
    if (!cancelarForm.idCliente && !selectedCliente?.idUsuario) {
      toast.error('No se ha seleccionado un cliente válido');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        ...cancelarForm,
        idCliente: cancelarForm.idCliente || selectedCliente.idUsuario
        };

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/pagos/cancelar-total`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al cancelar el préstamo');
      }

      toast.success('Préstamo cancelado correctamente');
      if (data.data && data.data.comprobante_url) {
        const comprobanteUrl = ensureHttpsUrl(data.data.comprobante_url);
        setModalContent({ capturaUrl: '', comprobanteUrl });
        setModalTitle(`Comprobante de Cancelación Total - Préstamo #${selectedPrestamo.idPrestamo}`);
        setModalError('');
        setShowComprobanteModal(true);
      }

      setShowCancelarModal(false);
      setShowConfirmationModal(false);
      if (selectedCliente) {
        await handleSelectCliente(selectedCliente);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al cancelar el préstamo');
    } finally {
      setLoading(false);
    }
  };

  const registrarReprogramacion = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/pagos/reprogramar-prestamo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reprogramarForm)
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al reprogramar el préstamo');
      }

      toast.success('Préstamo reprogramado correctamente');
      if (data.data && data.data.comprobante_url) {
        const comprobanteUrl = ensureHttpsUrl(data.data.comprobante_url);
        setModalContent({ capturaUrl: '', comprobanteUrl });
        setModalTitle(`Comprobante de Reprogramación - Préstamo #${selectedPrestamo.idPrestamo}`);
        setModalError('');
        setShowComprobanteModal(true);
      }

      setShowReprogramarModal(false);
      setShowConfirmationModal(false);
      if (selectedCliente) {
        await handleSelectCliente(selectedCliente);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al reprogramar el préstamo');
    } finally {
      setLoading(false);
    }
  };

  const registrarConvenio = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/pagos/convenio-prestamo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(convenioForm)
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al registrar el convenio');
      }

      toast.success('Convenio registrado correctamente');
      if (data.data && data.data.comprobante_url) {
        const comprobanteUrl = ensureHttpsUrl(data.data.comprobante_url);
        setModalContent({ capturaUrl: '', comprobanteUrl });
        setModalTitle(`Comprobante de Convenio - Préstamo #${selectedPrestamo.idPrestamo}`);
        setModalError('');
        setShowComprobanteModal(true);
      }

      setShowConvenioModal(false);
      setShowConfirmationModal(false);
      if (selectedCliente) {
        await handleSelectCliente(selectedCliente);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al registrar el convenio');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (action) => {
    if (confirmationAction === 'pagar-cuota') {
      registrarPagoCuota();
    } else if (confirmationAction === 'reducir-mora') {
      registrarReducirMora();
    } else if (confirmationAction === 'cancelar-prestamo') {
      registrarCancelacionPrestamo();
    } else if (confirmationAction === 'reprogramar-prestamo') {
      registrarReprogramacion();
    } else if (confirmationAction === 'convenio-prestamo') {
      registrarConvenio();
    }
  };
    const handleReset = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCliente(null);
    setCuotasPendientes([]);
    setSelectedCuota(null);
    setSelectedPrestamo(null);
    setFormData({
      idCuota: '',
      idCliente: '',
      monto_pagado: '',
      numero_operacion: '',
      observaciones: ''
    });
    setCancelarForm({
      idPrestamo: '',
      idCliente: '',
      monto_pagado: '',
      numero_operacion: '',
      observaciones: ''
    });
    setReprogramarForm({
      idPrestamo: '',
      tasa_interes: '1',
      observaciones: ''
    });
    setConvenioForm({
      idPrestamo: '',
      solo_capital: false,
      observaciones: ''
    });
    setErrors({});
    setModalContent({ capturaUrl: '', comprobanteUrl: '' });
    setModalTitle('');
    setModalError('');
  };
  const handleInputChange = (e, formType) => {
    const { name, value, type, checked } = e.target;
    if (formType === 'cuota') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'reducir-mora') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'cancelar') {
      setCancelarForm(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'reprogramar') {
      setReprogramarForm(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'convenio') {
      setConvenioForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const isEligibleForReprogramacion = (prestamo) => {
    const maxDiasMora = Math.max(...prestamo.cuotas.map(cuota => cuota.dias_mora));
    return maxDiasMora <= 8;
  };

  const isEligibleForConvenio = (prestamo) => {
    return prestamo.cuotas.some(cuota => cuota.dias_mora > 8);
  };

  const isCuotaPagable = (prestamo, cuota) => {
    const sortedCuotas = prestamo.cuotas.sort((a, b) => a.numero_cuota - b.numero_cuota);
    const previousCuotas = sortedCuotas.filter(c => c.numero_cuota < cuota.numero_cuota);
    const allPreviousPaid = previousCuotas.every(c => c.estado === 'pagado');
    const isCurrentUnpaid = !['pagado', 'prepagado'].includes(cuota.estado);
    return allPreviousPaid && isCurrentUnpaid;
  };

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
  };

  const handleCloseCapturaModal = () => {
    setShowCapturaModal(false);
    setModalContent({ capturaUrl: '', comprobanteUrl: '' });
    setModalTitle('');
    setModalError('');
    setSelectedCuota(null);
  };

  const handleCloseComprobanteModal = () => {
    setShowComprobanteModal(false);
    setModalContent({ capturaUrl: '', comprobanteUrl: '' });
    setModalTitle('');
    setModalError('');
    setSelectedCuota(null);
  };

  return (
    <div className="w-full h-full md:min-h-screen overflow-auto pb-16">
      {loading && <LoadingScreen />}

      <div className="bg-neutral-white shadow-lg rounded-lg p-3 sm:p-5 md:py-8 mx-auto w-full border-t-4 border-primary">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-6 text-primary text-center">
          REGISTRO DE CUOTAS DE PRÉSTAMOS
        </h2>

        <ClienteSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          handleReset={handleReset}
          searchResults={searchResults}
          handleSelectCliente={handleSelectCliente}
        />
          
        <PrestamosList
          selectedCliente={selectedCliente}
          cuotasPendientes={cuotasPendientes}
          isEligibleForReprogramacion={isEligibleForReprogramacion}
          isEligibleForConvenio={isEligibleForConvenio}
          isCuotaPagable={isCuotaPagable}
          formatDate={formatDate}
          handlePagarCuota={handlePagarCuota}
          handleVerCaptura={handleVerCaptura}
          handleVerComprobante={handleVerComprobante}
          handleCancelarPrestamo={handleCancelarPrestamo}
          handleReprogramarPrestamo={handleReprogramarPrestamo}
          handleConvenioPrestamo={handleConvenioPrestamo}
          handleSubirCapturaAbono={handleSubirCapturaAbono}
          handleReducirMora={handleReducirMora}
        />
      </div>

      <PagoCuotaModal
        show={showCuotaModal}
        onClose={() => setShowCuotaModal(false)}
        selectedCuota={selectedCuota}
        selectedPrestamo={selectedPrestamo}
        formData={formData}
        errors={errors}
        handleInputChange={(e) => handleInputChange(e, 'cuota')}
        handleConfirmAction={() => handleConfirmAction('pagar-cuota')}
        formatDate={formatDate}
      />

      <CapturaModal
        show={showCapturaModal}
        onClose={handleCloseCapturaModal}
        modalTitle={modalTitle}
        modalContent={modalContent}
        modalError={modalError}
        selectedCuota={selectedCuota}
        selectedCliente={selectedCliente}
        selectedPrestamo={selectedPrestamo}
        handleConfirmarPagoPrepagado={handleConfirmarPagoPrepagado}
        handleRechazarPagoPrepagado={handleRechazarPagoPrepagado}
      />

      <ComprobanteModal
        show={showComprobanteModal}
        onClose={handleCloseComprobanteModal}
        modalTitle={modalTitle}
        modalContent={modalContent}
        modalError={modalError}
        selectedCuota={selectedCuota}
        handleConfirmarPagoPrepagado={handleConfirmarPagoPrepagado}
      />

      <CancelarPrestamoModal
        show={showCancelarModal}
        onClose={() => setShowCancelarModal(false)}
        selectedPrestamo={selectedPrestamo}
        cancelarForm={cancelarForm}
        errors={errors}
        handleInputChange={(e) => handleInputChange(e, 'cancelar')}
        handleConfirmAction={() => handleConfirmAction('cancelar-prestamo')}
      />

      <ReprogramarPrestamoModal
        show={showReprogramarModal}
        onClose={() => setShowReprogramarModal(false)}
        selectedPrestamo={selectedPrestamo}
        reprogramarForm={reprogramarForm}
        errors={errors}
        handleInputChange={(e) => handleInputChange(e, 'reprogramar')}
        handleConfirmAction={() => handleConfirmAction('reprogramar-prestamo')}
      />

      <ConvenioPrestamoModal
        show={showConvenioModal}
        onClose={() => setShowConvenioModal(false)}
        selectedPrestamo={selectedPrestamo}
        convenioForm={convenioForm}
        errors={errors}
        handleInputChange={(e) => handleInputChange(e, 'convenio')}
        handleConfirmAction={() => handleConfirmAction('convenio-prestamo')}
      />

      <CapturaAbonoModal
        show={showCapturaAbonoModal}
        onClose={() => setShowCapturaAbonoModal(false)}
        clienteId={selectedCliente?.idUsuario}
        prestamoId={selectedPrestamo?.idPrestamo}
        modalTitle={`Subir Captura de Abono - Préstamo #${selectedPrestamo?.idPrestamo}`}
      />

      <ReducirMoraModal
        show={showReducirMoraModal}
        onClose={() => setShowReducirMoraModal(false)}
        selectedCuota={selectedCuota}
        selectedPrestamo={selectedPrestamo}
        formData={formData}
        errors={errors}
        handleInputChange={(e) => handleInputChange(e, 'reducir-mora')}
        handleConfirmAction={() => handleConfirmAction('reducir-mora')}
        formatDate={formatDate}
      />

      <ConfirmationModal
        show={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        confirmationAction={confirmationAction}
        formData={formData}
        cancelarForm={cancelarForm}
        reprogramarForm={reprogramarForm}
        convenioForm={convenioForm}
        handleConfirm={handleConfirm}
      />
    </div>
  );
}