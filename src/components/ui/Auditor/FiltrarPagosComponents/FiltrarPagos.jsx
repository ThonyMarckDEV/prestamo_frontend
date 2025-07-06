import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import PaymentReportViewer from './PaymentReportViewer';

const FiltrarPagos = () => {
  const [isGroupSearch, setIsGroupSearch] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [estado, setEstado] = useState('');
  const [selectedAsesor, setSelectedAsesor] = useState('');
  const [groups, setGroups] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAsesores, setLoadingAsesores] = useState(true);
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsResponse = await fetchWithAuth(`${API_BASE_URL}/api/admin/cronograma/grupos`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!groupsResponse.ok) throw new Error('Error al cargar grupos');
        const groupsData = await groupsResponse.json();
        setGroups(Array.isArray(groupsData) ? groupsData : []);

        setLoadingAsesores(true);
        const asesoresResponse = await fetchWithAuth(`${API_BASE_URL}/api/admin/asesores`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!asesoresResponse.ok) throw new Error('Error al cargar asesores');
        const asesoresData = await asesoresResponse.json();
        console.log('Asesores response:', asesoresData);
        const validAsesores = Array.isArray(asesoresData.asesores)
          ? asesoresData.asesores.filter(asesor => asesor && asesor.id && asesor.nombre)
          : [];
        setAsesores(validAsesores);
        if (validAsesores.length === 0) {
          setError('No se encontraron asesores válidos');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error al cargar datos');
      } finally {
        setLoadingAsesores(false);
      }
    };
    fetchData();
  }, []);

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      setError('Por favor, selecciona ambas fechas.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('La fecha de fin debe ser posterior o igual a la fecha de inicio.');
      return;
    }
    if (isGroupSearch && !selectedGroup) {
      setError('Por favor, selecciona un grupo.');
      return;
    }
    if (!isGroupSearch && !busquedaCliente) {
      setError('Por favor, ingrese un criterio de búsqueda para el cliente.');
      return;
    }

    setError('');
    setCuotas([]);
    setLoading(true);

    try {
      const payload = {
        start_date: startDate,
        end_date: endDate,
        ...(estado ? { estado } : {}),
        ...(isGroupSearch && selectedGroup ? { nombreGrupo: selectedGroup } : {}),
        ...(busquedaCliente ? { busquedaCliente } : {}),
        ...(selectedAsesor ? { idAsesor: parseInt(selectedAsesor, 10) } : {}),
      };

      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/pagos/filtrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al filtrar pagos');
      }

      const data = await response.json();
      setCuotas(data.cuotas || []);
      if (!data.cuotas.length) {
        setError(
          `No se encontraron pagos${estado ? ` con estado "${estado}"` : ''} en el rango de fechas.`
        );
      }
    } catch (err) {
      setError(err.message || 'Error al filtrar pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setIsGroupSearch(false);
    setBusquedaCliente('');
    setSelectedGroup('');
    setStartDate('');
    setEndDate('');
    setEstado('');
    setSelectedAsesor('');
    setCuotas([]);
    setError('');
    setShowReportViewer(false);
    setShowModal(false);
    setPdfUrl(null);
  };

  const handleGeneratePDF = () => {
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

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="font-sans p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        FILTRAR PAGOS
      </h2>

      {showReportViewer && (
        <PaymentReportViewer
          key={`report-pagos-${Date.now()}`}
          cuotas={cuotas}
          selectedAsesor={selectedAsesor}
          asesores={asesores}
          startDate={startDate}
          endDate={endDate}
          estado={estado}
          dni={busquedaCliente}
          selectedGroup={selectedGroup}
          onComplete={handlePDFComplete}
          onPDFGenerated={handlePDFGenerated}
        />
      )}

      {showModal && pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Vista previa del Reporte de Pagos</h2>
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
            onChange={() => setIsGroupSearch(!isGroupSearch)}
            className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="groupSearch" className="ml-2 text-sm font-medium text-gray-700">
            BUSCAR POR GRUPO
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {isGroupSearch ? (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SELECCIONAR GRUPO
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              >
                <option value="">SELECCIONE GRUPO</option>
                {groups.map(group => (
                  <option key={group.idGrupo} value={group.nombre}>
                    {group.nombre}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BÚSQUEDA DE CLIENTE (DNI, NOMBRE, APELLIDOS, ID)
              </label>
              <input
                type="text"
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value.toUpperCase())}
                placeholder="DNI, NOMBRE, APELLIDOS O ID CLIENTE"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FECHA INICIO
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FECHA FIN
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ASESOR
            </label>
            <select
              value={selectedAsesor}
              onChange={(e) => setSelectedAsesor(e.target.value)}
              disabled={loadingAsesores}
              className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${loadingAsesores ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              {loadingAsesores ? (
                <option value="">CARGANDO...</option>
              ) : (
                <>
                  <option value="">TODOS</option>
                  {asesores.map(asesor => (
                    <option key={asesor.id} value={asesor.id}>
                      {asesor.nombre}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          <div className="md:self-end md:col-span-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={handleFilter}
              disabled={(!startDate || !endDate || (isGroupSearch && !selectedGroup)) || loading}
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
              PAGOS
            </h3>
            <button
              onClick={handleGeneratePDF}
              disabled={cuotas.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-label="Ver reporte de pagos"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 inline-block"
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
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left font-medium text-gray-700 bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6">CLIENTE</th>
                  <th className="py-4 px-6">DNI</th>
                  <th className="py-4 px-2">ID PRESTAMO</th>
                  <th className="py-4 px-2">N° CUOTA</th>
                  <th className="py-4 px-4">VENCIMIENTO</th>
                  <th className="py-4 px-3">CAPITAL</th>
                  <th className="py-4 px-3">INTERÉS</th>
                  <th className="py-4 px-3">OTROS</th>
                  <th className="py-4 px-3">CUOTA</th>
                  <th className="py-4 px-2">DIAS MORA</th>
                  <th className="py-4 px-6">MORA</th>
                  <th className="py-4 px-6">ESTADO</th>
                  <th className="py-4 px-6">ASESOR</th>
                  <th className="py-4 px-6">OBSERVACIONES</th>
                </tr>
              </thead>
              <tbody>
                {cuotas.map(cuota => {
                  const otros =
                    cuota.otros !== null
                      ? parseFloat(cuota.otros)
                      : parseFloat(cuota.monto) -
                        parseFloat(cuota.capital) -
                        parseFloat(cuota.interes);
                  return (
                    <tr
                      key={cuota.idCuota}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-4 px-6">{cuota.cliente_nombre}</td>
                      <td className="py-4 px-6">{cuota.cliente_dni}</td>
                      <td className="py-4 px-2">{cuota.idPrestamo}</td>
                      <td className="py-4 px-1">{cuota.numero_cuota}</td>
                      <td className="py-4 px-4">{formatDate(cuota.fecha_vencimiento)}</td>
                      <td className="py-4 px-3">{parseFloat(cuota.capital).toFixed(2)}</td>
                      <td className="py-4 px-3">{parseFloat(cuota.interes).toFixed(2)}</td>
                      <td className="py-4 px-3">{otros.toFixed(2)}</td>
                      <td className="py-4 px-3">{parseFloat(cuota.monto).toFixed(2)}</td>
                      <td className="py-4 px-2">{cuota.dias_mora}</td>
                      <td className="py-4 px-6">
                        S/ {(parseFloat(cuota.mora) || 0).toFixed(2)}
                        {cuota.mora_reducida > 0 && (
                          <span className="text-xs text-green-600 ml-1">(-{cuota.mora_reducida}%)</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyles(
                            cuota.estado
                          )}`}
                        >
                          {cuota.estado}
                        </span>
                      </td>
                      <td className="py-4 px-6">{cuota.asesor_nombre}</td>
                      <td className="py-4 px-6">{cuota.observaciones || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-gray-700 bg-gray-50 border-t border-gray-200">
                  <td colSpan="5" className="py-4 px-6">
                    TOTALES
                  </td>
                  <td className="py-4 px-3">
                    {cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.capital), 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-3">
                    {cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.interes), 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-3">
                    {cuotas.reduce(
                      (sum, cuota) =>
                        sum +
                        (cuota.otros !== null
                          ? parseFloat(cuota.otros)
                          : parseFloat(cuota.monto) -
                            parseFloat(cuota.capital) -
                            parseFloat(cuota.interes)),
                      0
                    ).toFixed(2)}
                  </td>
                  <td className="py-4 px-3">
                    {cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.monto), 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-2"></td>
                  <td className="py-4 px-6"></td>
                  <td className="py-4 px-6"></td>
                  <td className="py-4 px-6"></td>
                  <td className="py-4 px-6"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrarPagos;