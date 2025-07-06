import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import FetchWithGif from '../../../../components/Reutilizables/FetchWithGif';
import ComprobanteModal from './ComprobanteModal';
import CapturaAbonoModal from './CapturaAbonoModal';
import ReportePrestamosTotales from './ReportePrestamosTotales';
import DetallePrestamoCuotas from './DetallePrestamoCuotas';
import { format, parseISO } from 'date-fns';

const ITEMS_PER_PAGE = 4;

const FiltrarPrestamos = () => {
  const [isGroupSearch, setIsGroupSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedLoan, setSelectedLoan] = useState('');
  const [estado, setEstado] = useState('');
  const [selectedAsesor, setSelectedAsesor] = useState('');
  const [groups, setGroups] = useState([]);
  const [clients, setClients] = useState([]);
  const [loans, setLoans] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);
  const [clientPage, setClientPage] = useState(1);
  const [loanPage, setLoanPage] = useState(1);
  const [clientSearch, setClientSearch] = useState('');
  const [filterClientsWithLoans, setFilterClientsWithLoans] = useState(false);
  const [showLoadingGif, setShowLoadingGif] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [selectedCuotaId, setSelectedCuotaId] = useState(null);
  const [comprobanteData, setComprobanteData] = useState({ comprobanteUrl: '' });
  const [comprobanteError, setComprobanteError] = useState('');
  const [loadingComprobante, setLoadingComprobante] = useState(false);
  const [showCapturaAbonoModal, setShowCapturaAbonoModal] = useState(false);
  const [selectedLoanForAbono, setSelectedLoanForAbono] = useState(null);
  const [selectedClientForAbono, setSelectedClientForAbono] = useState(null);
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [reportType, setReportType] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchAdvisors();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/groups`);
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      setError('Error al cargar los grupos');
    }
  };

  const fetchAdvisors = async () => {
    try {
      setLoadingAdvisors(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/advisors`);
      const data = await response.json();
      setAsesores(data);
    } catch (err) {
      setError('Error al cargar los asesores');
    } finally {
      setLoadingAdvisors(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isGroupSearch && selectedGroup) {
        fetchClients({ group_id: selectedGroup, search: clientSearch, with_loans: filterClientsWithLoans });
      } else if (!isGroupSearch && selectedAsesor) {
        fetchClients({ advisor_id: selectedAsesor, search: clientSearch, with_loans: filterClientsWithLoans });
      } else if (!isGroupSearch && query) {
        fetchClients({ search: query, with_loans: filterClientsWithLoans });
      } else {
        setClients([]);
        setSelectedClient('');
        setLoans([]);
        setSelectedLoan('');
        setCuotas([]);
        setClientPage(1);
        setFilterClientsWithLoans(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [isGroupSearch, selectedGroup, selectedAsesor, clientSearch, filterClientsWithLoans, query]);

  const fetchClients = async (params) => {
    try {
      setLoading(true);
      setShowLoadingGif(true);
      const queryString = new URLSearchParams(params).toString();
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/clients?${queryString}`);
      const data = await response.json();
      setClients(data);
      setSelectedClient('');
      setLoans([]);
      setSelectedLoan('');
      setCuotas([]);
      setClientPage(1);
    } catch (err) {
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
      setShowLoadingGif(false);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      fetchLoans({ client_id: selectedClient, page: loanPage });
    } else {
      setLoans([]);
      setSelectedLoan('');
      setCuotas([]);
      setLoanPage(1);
    }
  }, [selectedClient, loanPage]);

  const fetchLoans = async (params) => {
      try {
          setLoading(true);
          setShowLoadingGif(true);
          const cleanParams = Object.fromEntries(
              Object.entries(params).filter(([_, v]) => v !== '')
          );
          // Add advisor_id to the params if selectedAsesor exists
          if (selectedAsesor) {
              cleanParams.advisor_id = selectedAsesor;
          }
          const queryString = new URLSearchParams(cleanParams).toString();
          const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/loans?${queryString}`);
          const data = await response.json();
          setLoans(data.data || []);
          setSelectedLoan('');
          setCuotas([]);
      } catch (err) {
          setError('Error al cargar los préstamos');
      } finally {
          setLoading(false);
          setShowLoadingGif(false);
      }
  };

  useEffect(() => {
    if (selectedLoan) {
      handleFilter();
    } else {
      setCuotas([]);
    }
  }, [selectedLoan, estado]);

  const handleFilter = async () => {
    if (!selectedLoan) {
      setCuotas([]);
      return;
    }

    try {
      setLoading(true);
      setShowLoadingGif(true);
      const params = { loan_id: selectedLoan };
      if (estado) params.estado = estado;

      const queryString = new URLSearchParams(params).toString();
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/installments?${queryString}`);
      const data = await response.json();
      setCuotas(data);
      setError('');
    } catch (err) {
      setError('Error al filtrar las cuotas');
    } finally {
      setLoading(false);
      setShowLoadingGif(false);
    }
  };

  // Ensure HTTPS for non-localhost URLs
  const ensureHttpsUrl = (url) => {
    if (!url) return url;
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return url;
    }
    return url.replace(/^http:/, 'https:');
  };

  const fetchComprobante = async (idCuota) => {
    try {
      setLoadingComprobante(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/pagos/comprobante/${idCuota}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener el comprobante');
      }
      const comprobanteUrl = data.comprobante_url ? ensureHttpsUrl(data.comprobante_url) : '';
      console.log('Original comprobante URL:', data.comprobante_url);
      console.log('Transformed comprobante URL:', comprobanteUrl);
      setComprobanteData({ comprobanteUrl });
      setComprobanteError('');
    } catch (err) {
      setComprobanteError(err.message || 'Error al obtener el comprobante');
      setComprobanteData({ comprobanteUrl: '' });
    } finally {
      setLoadingComprobante(false);
    }
  };

  const handleViewComprobante = (cuotaId) => {
    setSelectedCuotaId(cuotaId);
    setShowComprobanteModal(true);
    fetchComprobante(cuotaId);
  };

  const handleViewAbono = (loanId, clientId) => {
    setSelectedLoanForAbono(loanId);
    setSelectedClientForAbono(clientId);
    setShowCapturaAbonoModal(true);
  };

  const handleClearFilters = () => {
    setIsGroupSearch(false);
    setQuery('');
    setSelectedGroup('');
    setSelectedClient('');
    setSelectedLoan('');
    setEstado('');
    setSelectedAsesor('');
    setClients([]);
    setLoans([]);
    setCuotas([]);
    setError('');
    setClientPage(1);
    setLoanPage(1);
    setClientSearch('');
    setFilterClientsWithLoans(false);
    setShowComprobanteModal(false);
    setShowCapturaAbonoModal(false);
    setShowReportViewer(false);
    setReportType('');
    setShowModal(false);
    setPdfUrl(null);
  };

  const handleClientClick = (clientId) => {
    if (selectedClient === clientId) {
      setSelectedClient('');
      setLoans([]);
      setSelectedLoan('');
      setCuotas([]);
    } else {
      setSelectedClient(clientId);
      setSelectedLoan('');
      setCuotas([]);
      setLoanPage(1);
    }
  };

  const handleLoanClick = (loanId) => {
    if (selectedLoan !== loanId) {
      setSelectedLoan(loanId);
    }
  };

  const getStatusStyles = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'pagado':
        return 'bg-green-100 text-green-800';
      case 'vence_hoy':
        return 'bg-orange-100 text-orange-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      case 'prepagado':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-gray-300 text-gray-900';
      case 'refinanciado':
        return 'bg-purple-100 text-purple-800';
      case 'mora':
        return 'bg-red-200 text-red-900';
      case 'reprogramado':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateLoansPDF = () => {
    setReportType('loans');
    setShowReportViewer(true);
  };

  const handleGenerateInstallmentsPDF = () => {
    setReportType('installments');
    setShowReportViewer(true);
  };

  const handlePDFGenerated = (url) => {
    setPdfUrl(url);
    setShowModal(true);
  };

  const handlePDFComplete = () => {
    setShowReportViewer(false);
  };

  const closeModal = () => {
    setShowModal(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const paginatedClients = clients.slice(
    (clientPage - 1) * ITEMS_PER_PAGE,
    clientPage * ITEMS_PER_PAGE
  );
  const totalClientPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
  const paginatedLoans = loans.slice(
    (loanPage - 1) * ITEMS_PER_PAGE,
    loanPage * ITEMS_PER_PAGE
  );
  const totalLoanPages = Math.ceil(loans.length / ITEMS_PER_PAGE);

  return (
    <div className="font-sans p-6">
      {showLoadingGif && <FetchWithGif />}
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        FILTRAR PRÉSTAMOS
      </h2>

      <ComprobanteModal
        show={showComprobanteModal}
        onClose={() => {
          setShowComprobanteModal(false);
          setSelectedCuotaId(null);
          setComprobanteData({ comprobanteUrl: '' });
          setComprobanteError('');
          setLoadingComprobante(false);
        }}
        modalTitle="Comprobante de Pago"
        modalContent={comprobanteData}
        modalError={comprobanteError}
        selectedCuota={cuotas.find(cuota => cuota.idCuota === selectedCuotaId)}
        handleConfirmarPagoPrepagado={() => {}}
        loadingComprobante={loadingComprobante}
      />

      <CapturaAbonoModal
        show={showCapturaAbonoModal}
        onClose={() => {
          setShowCapturaAbonoModal(false);
          setSelectedLoanForAbono(null);
          setSelectedClientForAbono(null);
        }}
        clienteId={selectedClientForAbono}
        prestamoId={selectedLoanForAbono}
        modalTitle="Captura de Abono"
      />

      {showReportViewer && reportType === 'loans' && (
        <ReportePrestamosTotales
          key={`report-loans-${Date.now()}`}
          loans={loans}
          selectedClient={selectedClient}
          clients={clients}
          asesores={asesores}
          selectedAsesor={selectedAsesor}
          onComplete={handlePDFComplete}
          onPDFGenerated={handlePDFGenerated}
        />
      )}

      {showReportViewer && reportType === 'installments' && (
        <DetallePrestamoCuotas
          key={`report-installments-${Date.now()}`}
          cuotas={cuotas}
          selectedClient={selectedClient}
          selectedLoan={selectedLoan}
          clients={clients}
          loans={loans}
          asesores={asesores}
          selectedAsesor={selectedAsesor}
          onComplete={handlePDFComplete}
          onPDFGenerated={handlePDFGenerated}
        />
      )}

      {showModal && pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Vista previa del {reportType === 'loans' ? 'Reporte de Préstamos' : 'Reporte de Cuotas'}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 bg-white shadow-lg rounded-xl p-6 border-t-4 border-red-600">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="groupSearch"
            checked={isGroupSearch}
            onChange={() => {
              setIsGroupSearch(!isGroupSearch);
              setSelectedAsesor('');
              setSelectedGroup('');
              setClients([]);
              setSelectedClient('');
              setSelectedLoan('');
              setCuotas([]);
              setQuery('');
              setClientSearch('');
              setFilterClientsWithLoans(false);
            }}
            className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="groupSearch" className="ml-2 text-sm font-medium text-gray-700">
            BUSCAR POR GRUPO
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {isGroupSearch ? (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium Emulator Ideal Sans, -apple-system, system-ui, sans-serif text-gray-700 mb-1">
                SELECCIONAR GRUPO
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  setSelectedAsesor('');
                  setSelectedClient('');
                  setSelectedLoan('');
                  setCuotas([]);
                  setClientPage(1);
                  setFilterClientsWithLoans(false);
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              >
                <option value="">SELECCIONE GRUPO</option>
                {groups.map(group => (
                  <option key={group.idGrupo} value={group.idGrupo}>
                    {group.nombre}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium Emulator Ideal Sans, -apple-system, system-ui, sans-serif text-gray-700 mb-1">
                BUSCAR CLIENTE (DNI, ID, NOMBRE O APELLIDO)
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value.toUpperCase()); // Convert input to uppercase
                  setSelectedClient('');
                  setSelectedLoan('');
                  setCuotas([]);
                  setLoanPage(1);
                }}
                placeholder="INGRESE DNI, ID, NOMBRE O APELLIDO"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium Emulator Ideal Sans, -apple-system, system-ui, sans-serif text-gray-700 mb-1">
              ESTADO
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            >
              <option value="">TODOS</option>
              <option value="pendiente">PENDIENTE</option>
              <option value="pagado">PAGADO</option>
              <option value="vence_hoy">VENCE HOY</option>
              <option value="vencido">VENCIDO</option>
              <option value="prepagado">PREPAGADO</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium Emulator Ideal Sans, -apple-system, system-ui, sans-serif text-gray-700 mb-1">
              ASESOR
            </label>
            <select
              value={selectedAsesor}
              onChange={(e) => {
                setSelectedAsesor(e.target.value);
                setSelectedGroup('');
                setIsGroupSearch(false);
                setSelectedClient('');
                setSelectedLoan('');
                setCuotas([]);
                setClientPage(1);
                setFilterClientsWithLoans(false);
              }}
              disabled={loadingAdvisors}
              className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                loadingAdvisors ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              {loadingAdvisors ? (
                <option value="">CARGANDO...</option>
              ) : (
                <>
                  <option value="">TODOS</option>
                  {asesores.map(asesor => (
                    <option key={asesor.id} value={asesor.id}>
                      {asesor.nombre} {asesor.apellidoPaterno} {asesor.apellidoMaterno}
                      {asesor.apellidoConyuge ? ` ${asesor.apellidoConyuge}` : ''}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          <div className="md:self-end md:col-span-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={handleFilter}
              disabled={(!selectedLoan || loading)}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition transform hover:scale-105"
            >
              {loading ? 'Filtrando...' : 'Filtrar'}
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full md:w-auto bg-white border border-red-600 text-red-600 hover:bg-red-50 font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105"
            >
              LIMPIAR FILTROS
            </button>
          </div>
        </div>
      </div>

      {(isGroupSearch || selectedAsesor || query) && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            CLIENTES
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value.toUpperCase()); // Convert input to uppercase
                setClientPage(1);
              }}
              placeholder="Buscar cliente en esta página..."
              className="w-full sm:w-1/2 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />
          </div>
          {paginatedClients.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedClients.map(client => (
                  <button
                    key={client.idUsuario}
                    onClick={() => handleClientClick(client.idUsuario)}
                    className={`bg-white shadow-lg rounded-xl p-6 border-t-4 text-left ${
                      selectedClient === client.idUsuario ? 'border-blue-500' : 'border-gray-200'
                    } hover:shadow-xl hover:border-blue-300 transition transform hover:scale-105 cursor-pointer focus:outline-none`}
                  >
                    <h4 className="text-lg font-semibold text-gray-900">
                      {client.nombre} {client.apellidoPaterno} {client.apellidoMaterno}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">DNI: {client.dni}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Préstamos: {client.prestamoCount}
                    </p>
                  </button>
                ))}
              </div>
              {totalClientPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  <button
                    onClick={() => setClientPage(prev => Math.max(prev - 1, 1))}
                    disabled={clientPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2">
                    Página {clientPage} de {totalClientPages}
                  </span>
                  <button
                    onClick={() => setClientPage(prev => Math.min(prev + 1, totalClientPages))}
                    disabled={clientPage === totalClientPages}
                    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            !loading && (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-red-200">
                No se encontraron clientes para los filtros seleccionados.
              </div>
            )
          )}
        </div>
      )}

      {loans.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              PRÉSTAMOS
            </h3>
            <button
              onClick={handleGenerateLoansPDF}
              disabled={!selectedClient}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Reporte Préstamos
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedLoans.map(loan => (
              <div
                key={loan.idPrestamo}
                onClick={() => handleLoanClick(loan.idPrestamo)}
                className={`bg-white shadow-lg rounded-xl p-6 border-t-4 text-left ${
                  selectedLoan === loan.idPrestamo ? 'border-blue-500' : 'border-gray-200'
                } hover:shadow-xl hover:border-blue-300 transition transform hover:scale-105 cursor-pointer focus:outline-none`}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLoanClick(loan.idPrestamo);
                  }
                }}
              >
                <h4 className="text-lg font-semibold text-gray-900">
                  ID Préstamo: {loan.idPrestamo}
                </h4>
                <p className="text-sm text-gray-600 mt-1">Abonado Por: {loan.abonado_por || 'N/A'}</p>
                <p className="text-sm text-gray-600 mt-1">Cliente: {loan.cliente}</p>
                <p className="text-sm text-gray-600 mt-1">Monto: S/ {parseFloat(loan.monto).toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">Total: S/ {parseFloat(loan.total).toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">Cuotas: {loan.cuotas}</p>
                <p className="text-sm text-gray-600 mt-1">Valor Cuota: S/ {parseFloat(loan.valor_cuota).toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">Frecuencia: {loan.frecuencia}</p>
                <p className="text-sm text-gray-600 mt-1">Fecha Inicio: {formatDate(loan.fecha_inicio)}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Estado: <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyles(loan.estado)}`}>{loan.estado}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">Asesor: {loan.asesor}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAbono(loan.idPrestamo, selectedClient);
                  }}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition transform hover:scale-105"
                  aria-label="Ver captura de abono"
                >
                  Ver Abono
                </button>
              </div>
            ))}
          </div>
          {totalLoanPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => setLoanPage(prev => Math.max(prev - 1, 1))}
                disabled={loanPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-4 py-2">
                Página {loanPage} de {totalLoanPages}
              </span>
              <button
                onClick={() => setLoanPage(prev => Math.min(prev + 1, totalLoanPages))}
                disabled={loanPage === totalLoanPages}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex justify-center mb-6">
          <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {cuotas.length > 0 && (
        <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-yellow-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              CUOTAS
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleGenerateInstallmentsPDF}
                disabled={!selectedLoan}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Reporte Cuotas
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left font-medium text-gray-700 bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4">CLIENTE</th>
                  <th className="py-3 px-4">DNI</th>
                  <th className="py-3 px-4">ID CUOTA</th>
                  <th className="py-3 px-4">N° CUOTA</th>
                  <th className="py-3 px-4">VENCIMIENTO</th>
                  <th className="py-3 px-4">CAPITAL</th>
                  <th className="py-3 px-4">INTERÉS</th>
                  <th className="py-3 px-4">DÍAS MORA</th>
                  <th className="py-3 px-4">MORA</th>
                  <th className="py-3 px-4">OTROS</th>
                  <th className="py-3 px-4">CUOTA</th>
                  <th className="py-3 px-4">ESTADO</th>
                  <th className="py-3 px-4">ASESOR</th>
                  <th className="py-3 px-4">COMPROBANTE</th>
                  <th className="py-3 px-4">OBSERVACIONES</th>
                </tr>
              </thead>
              <tbody>
                {cuotas.map(cuota => (
                  <tr
                    key={cuota.idCuota}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">{cuota.cliente_nombre}</td>
                    <td className="py-3 px-4">{cuota.cliente_dni}</td>
                    <td className="py-3 px-4">{cuota.idCuota}</td>
                    <td className="py-3 px-4">{cuota.numero_cuota}</td>
                    <td className="py-3 px-4">{formatDate(cuota.fecha_vencimiento)}</td>
                    <td className="py-3 px-4">{parseFloat(cuota.capital).toFixed(2)}</td>
                    <td className="py-3 px-4">{parseFloat(cuota.interes).toFixed(2)}</td>
                    <td className="py-3 px-4">{cuota.dias_mora}</td>
                    <td className="py-3 px-4">
                      S/ {(parseFloat(cuota.mora) || 0).toFixed(2)}
                      {cuota.mora_reducida > 0 && (
                        <span className="text-xs text-green-600 ml-1">(-{cuota.mora_reducida}%)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{parseFloat(cuota.otros).toFixed(2)}</td>
                    <td className="py-3 px-4">{parseFloat(cuota.monto).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyles(
                          cuota.estado
                        )}`}
                      >
                        {cuota.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4">{cuota.asesor_nombre}</td>
                    <td className="py-3 px-2 text-center">
                      {cuota.estado === 'pagado' && (
                        <button
                          onClick={() => handleViewComprobante(cuota.idCuota)}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold p-2 rounded-lg transition transform hover:scale-105"
                          aria-label="Ver comprobante de pago"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4">{cuota.observaciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-gray-700 bg-gray-50 border-t border-gray-200">
                  <td colSpan="4" className="py-3 px-4">
                    TOTALES
                  </td>
                  <td className="py-3 px-4">
                    
                  </td>
                  <td className="py-3 px-4">
                    {cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.capital), 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    {cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.interes), 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    {cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.dias_mora || 0), 0)}
                  </td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4">
                    {cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.otros), 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    {cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.monto), 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const formatDate = (dateString) => {
  try {
    if (!dateString) return '-';
    return format(parseISO(dateString), 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return '-';
  }
};

export default FiltrarPrestamos;