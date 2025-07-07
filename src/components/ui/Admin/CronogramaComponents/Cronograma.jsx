import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import FetchWithGif from '../../../../components/Reutilizables/FetchWithGif';

const Cronograma = () => {
  const [isGroupSearch, setIsGroupSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groups, setGroups] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/cronograma/grupos`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setGroups(data);
      } catch (err) {
        setError('Error al cargar grupos');
      }
    };
    fetchGroups();
  }, []);

  // Handle search
  const handleSearch = async () => {
    setError('');
    setPrestamos([]);
    setSelectedPrestamo(null);
    setCuotas([]);
    setPdfUrl('');
    setLoading(true);

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/cronograma/buscar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm: isGroupSearch ? selectedGroup : searchTerm,
          isGroupSearch,
        }),
      });
      const responseData = await response.json();
      if (responseData.message && !responseData.prestamos?.length) {
        setError(responseData.message);
      }
      const prestamosData = Array.isArray(responseData.prestamos) ? responseData.prestamos : [];
      setPrestamos(prestamosData);
    } catch (err) {
      setError(err.message || 'Error al buscar préstamos');
    } finally {
      setLoading(false);
    }
  };

  // Handle generate cronograma
  const handleGenerateCronograma = async (prestamoId) => {
    setLoading(true);
    setError('');
    setCuotas([]);
    setPdfUrl('');
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/cronograma/generar/${prestamoId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Error al generar el cronograma');
      }
      const data = await response.json();
      setCuotas(data.cuotas || []);
      setPdfUrl(data.pdf_url || '');
    } catch (err) {
      setError(err.message || 'Error al generar el cronograma');
    } finally {
      setLoading(false);
    }
  };

  // Format date safely
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {loading && <FetchWithGif />}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          GESTIÓN DE CRONOGRAMA DE PAGOS
        </h2>

        {/* Search Form */}
        <div className="mb-8 bg-white shadow-lg rounded-xl p-6 border-t-4 border-primary-600">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="groupSearch"
              checked={isGroupSearch}
              onChange={() => setIsGroupSearch(!isGroupSearch)}
              className="h-5 w-5 text-red-600 focus:ring-primary-600 border-gray-300 rounded"
            />
            <label htmlFor="groupSearch" className="ml-2 text-sm font-medium text-gray-700">
              BUSCAR POR GRUPO
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isGroupSearch ? (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SELECCIONAR GRUPO
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition"
                  >
                    <option value="">SELECCIONE EL GRUPO</option>
                    {groups.map(group => (
                      <option key={group.idGrupo} value={group.nombre}>
                        {group.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:self-end">
                  <button
                    onClick={handleSearch}
                    disabled={!selectedGroup || loading}
                    className="w-full bg-primary-light hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition transform hover:scale-105"
                  >
                    {loading ? 'BUSCANDO...' : 'BUSCAR'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BUSCAR CLIENTE
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    placeholder="INGRESE DNI, ID CLIENTE, NOMBRE O APELLIDOS"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600s transition"
                  />
                </div>
                <div className="md:self-end">
                  <button
                    onClick={handleSearch}
                    disabled={!searchTerm || loading}
                    className="w-full bg-primary-light hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition transform hover:scale-105"
                  >
                    {loading ? 'BUSCANDO...' : 'BUSCAR'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Prestamos Table */}
        {prestamos.length > 0 && (
          <div className="mb-8 bg-white shadow-lg rounded-xl p-6 border-t-4 border-primary-600">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              PRÉSTAMOS ENCONTRADOS
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left font-medium text-gray-700 bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6">ID PRÉSTAMO</th>
                    <th className="py-4 px-6">MONTO</th>
                    <th className="py-4 px-6">FRECUENCIA</th>
                    <th className="py-4 px-6">CUOTAS</th>
                    <th className="py-4 px-6">FECHA INICIO</th>
                    <th className="py-4 px-6">CLIENTE</th>
                    <th className="py-4 px-6">DNI</th>
                    <th className="py-4 px-6">ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamos.map(prestamo => (
                    <tr
                      key={prestamo.idPrestamo}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-4 px-6">{prestamo.idPrestamo}</td>
                      <td className="py-4 px-6">
                        S/ {parseFloat(prestamo.monto).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">{prestamo.frecuencia}</td>
                      <td className="py-4 px-6">{prestamo.cuotas}</td>
                      <td className="py-4 px-6">
                        {formatDate(prestamo.fecha_inicio)}
                      </td>
                      <td className="py-4 px-6">{prestamo.cliente}</td>
                      <td className="py-4 px-6">{prestamo.dni}</td>
                      <td className="py-4 px-6 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPrestamo(prestamo.idPrestamo);
                            handleGenerateCronograma(prestamo.idPrestamo);
                          }}
                          className="bg-primary-light hover:bg-primary-dark text-white text-sm font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105"
                        >
                          VER CRONOGRAMA
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cuotas Table */}
        {cuotas.length > 0 && (
          <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-primary-600">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              CRONOGRAMA DE PAGOS
            </h3>
            {pdfUrl && (
              <div className="mb-6">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-primary-light hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105"
                >
                  DESCARGAR PDF
                </a>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left font-medium text-gray-700 bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6">N°</th>
                    <th className="py-4 px-6">VENCIMIENTO</th>
                    <th className="py-4 px-6">CAPITAL</th>
                    <th className="py-4 px-6">INTERÉS</th>
                    <th className="py-4 px-6">OTROS</th>
                    <th className="py-4 px-6">CUOTA</th>
                    <th className="py-4 px-6">ESTADO</th>
                    <th className="py-4 px-6 w-1/4">OBSERVACIONES</th>
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
                        <td className="py-4 px-6">{cuota.numero_cuota}</td>
                        <td className="py-4 px-6">
                          {formatDate(cuota.fecha_vencimiento)}
                        </td>
                        <td className="py-4 px-6">
                          {parseFloat(cuota.capital).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          {parseFloat(cuota.interes).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">{otros.toFixed(2)}</td>
                        <td className="py-4 px-6">
                          {parseFloat(cuota.monto).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block py-1 px-3 rounded-full text-xs font-medium
                              ${cuota.estado === 'pagado'
                                ? 'bg-green-100 text-green-800'
                                : cuota.estado === 'pendiente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : cuota.estado === 'prepagado'
                                ? 'bg-blue-200 text-blue-700'
                                : 'bg-red-100 text-red-800'}`}
                          >
                            {cuota.estado.charAt(0).toUpperCase() +
                              cuota.estado.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {cuota.observaciones || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="font-semibold text-gray-700 bg-gray-50 border-t border-gray-200">
                    <td colSpan="2" className="py-4 px-6">
                      TOTALES
                    </td>
                    <td className="py-4 px-6">
                      {cuotas
                        .reduce((sum, cuota) => sum + parseFloat(cuota.capital), 0)
                        .toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      {cuotas
                        .reduce((sum, cuota) => sum + parseFloat(cuota.interes), 0)
                        .toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      {cuotas
                        .reduce(
                          (sum, cuota) =>
                            sum +
                            (cuota.otros !== null
                              ? parseFloat(cuota.otros)
                              : parseFloat(cuota.monto) -
                                parseFloat(cuota.capital) -
                                parseFloat(cuota.interes)),
                          0
                        )
                        .toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      {cuotas
                        .reduce((sum, cuota) => sum + parseFloat(cuota.monto), 0)
                        .toFixed(2)}
                    </td>
                    <td colSpan="2" className="py-4 px-6"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cronograma;