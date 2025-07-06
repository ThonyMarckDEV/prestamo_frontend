import React, { useState, useEffect } from 'react';
import FormClientes from '../../../components/ui/Asesor/ClientesComponents/FormClientes';
import ClientesCard from '../../../components/ui/Asesor/ClientesComponents/ClientesCard';
import { fetchWithAuth } from '../../../js/authToken';
import API_BASE_URL from '../../../js/urlHelper';
import SkeletonClienteCard from '../../../components/ui/Asesor/ClientesComponents/LoadingSkeletons/SkeletonLoadingClienteCard';

const ClientesUI = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [avalFilter, setAvalFilter] = useState('all');
  const clientesPerPage = 6;

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    filterClientes();
  }, [clientes, searchTerm, statusFilter, avalFilter]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/clientes/getclients`);
      
      if (!response.ok) {
        throw new Error('Error al cargar clientes');
      }
      
      const data = await response.json();
      console.log('Clientes fetched:', data.clientes); // Debug log
      setClientes(data.clientes);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los clientes. Por favor, intente nuevamente más tarde.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterClientes = () => {
    let result = [...clientes];
  
    if (statusFilter !== 'all') {
      result = result.filter(cliente => cliente.estado === parseInt(statusFilter));
    }    
  
    if (avalFilter !== 'all') {
      const filterAval = avalFilter === 'true';
      result = result.filter(cliente => cliente.datos?.aval === filterAval);
    }
  
    if (searchTerm) {
      const termWords = searchTerm.toLowerCase().split(/\s+/);
  
      result = result.filter(cliente => {
        const nombre = cliente.datos?.nombre?.toLowerCase() || '';
        const apellido = cliente.datos?.apellido?.toLowerCase() || '';
        const dni = cliente.datos?.dni?.toLowerCase() || '';
  
        const fullText = `${nombre} ${apellido}`.toLowerCase();
  
        return termWords.every(word =>
          fullText.includes(word) || dni.includes(word)
        );
      });
    }
  
    setFilteredClientes(result);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setAvalFilter('all');
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
      
      if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - (maxVisiblePages - 3));
      }
      
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const handleClientAdded = (newClientResponse) => {
    const newClient = newClientResponse.cliente; // Extract cliente from response
    console.log('New client added:', newClient); // Debug log
    setClientes([newClient, ...clientes]);
    resetForm();
    fetchClientes(); // Refetch to ensure consistency
  };

  const handleClientUpdated = (updatedClientResponse) => {
    const updatedClient = updatedClientResponse.cliente; // Extract cliente from response
    console.log('Client updated:', updatedClient); // Debug log
    setClientes(clientes.map(cliente => 
      cliente.idUsuario === updatedClient.idUsuario ? updatedClient : cliente
    ));
    resetForm();
    // Avoid immediate refetch to prevent overwriting state
  };

  const handleStatusChange = (clientId, newStatus) => {
    setClientes(clientes.map(cliente => 
      cliente.idUsuario === clientId ? { ...cliente, estado: newStatus } : cliente
    ));
  };

  const handleEditClient = (cliente) => {
    setIsEditing(true);
    setEditingClient(cliente);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingClient(null);
    setShowForm(false);
  };

  const toggleForm = () => {
    if (isEditing) {
      resetForm();
    } else {
      setShowForm(!showForm);
      if (!showForm) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const indexOfLastCliente = currentPage * clientesPerPage;
  const indexOfFirstCliente = indexOfLastCliente - clientesPerPage;
  const currentClientes = filteredClientes.slice(indexOfFirstCliente, indexOfLastCliente);
  const totalPages = Math.ceil(filteredClientes.length / clientesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-4">
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h1 className="text-xl font-bold text-red-800">REGISTRO DE CLIENTES</h1>
              <button
                onClick={toggleForm}
                className={`${
                  isEditing || showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                } text-white font-bold py-2 px-4 rounded flex items-center w-full sm:w-auto justify-center`}
              >
                {isEditing ? (
                  'CANCELAR EDICIÓN'
                ) : showForm ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    CERRAR FORMULARIO
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    AGREGAR NUEVO CLIENTE
                  </>
                )}
              </button>
            </div>
          </div>
          
          {showForm && (
            <div className="mb-4 bg-white rounded-lg shadow-lg border-t-4 border-red-600">
              <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white py-2 px-4 rounded-t-lg flex justify-between items-center">
                <h2 className="text-lg font-bold">{isEditing ? 'EDITAR CLIENTE' : 'AGREGAR NUEVO CLIENTE'}</h2>
                <button 
                  onClick={resetForm}
                  className="text-white hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <FormClientes 
                  onClientAdded={handleClientAdded} 
                  onClientUpdated={handleClientUpdated} // Fixed prop typo
                  initialData={editingClient}
                  isEditing={isEditing}
                  onCancel={resetForm}
                />
              </div>
            </div>
          )}
          
          {/* Search and Filter Section */}
          <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Input */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  BUSCAR CLIENTE
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    placeholder="BUSCAR POR NOMBRES, APELLIDOS O DNI..."
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm py-2 border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  FILTRAR POR ESTADO
                </label>
                <select
                  id="status"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm py-2 border"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">TODOS LOS ESTADOS</option>
                  <option value="1">ACTIVOS</option>
                  <option value="0">INACTIVOS</option>
                </select>
              </div>

              <div>
                <label htmlFor="aval" className="block text-sm font-medium text-gray-700 mb-1">
                  FILTRAR POR AVAL
                </label>
                <select
                  id="aval"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm py-2 border"
                  value={avalFilter}
                  onChange={(e) => setAvalFilter(e.target.value)}
                >
                  <option value="all">TODOS LOS CLIENTES</option>
                  <option value="true">SOLO AVALES</option>
                  <option value="false">NO AVALES</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearAllFilters}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  LIMPIAR FILTROS
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array(6).fill().map((_, index) => (
                <SkeletonClienteCard key={`skeleton-${index}`} />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                <h2 className="text-lg font-semibold text-red-800 mb-1 sm:mb-0">LISTADO DE CLIENTES</h2>
                <div className="text-sm text-gray-600">
                  {filteredClientes.length > 0 ? (
                    `MOSTRANDO ${indexOfFirstCliente + 1} - ${Math.min(indexOfLastCliente, filteredClientes.length)} de ${filteredClientes.length}`
                  ) : (
                    "NO HAY CLIENTES QUE COINCIDAN CON FILTROS APLICADOS"
                  )}
                </div>
              </div>
              
              {filteredClientes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentClientes.map(cliente => (
                    <ClientesCard
                      key={cliente.idUsuario}
                      cliente={cliente}
                      onStatusChange={handleStatusChange}
                      onEdit={() => handleEditClient(cliente)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <p className="text-gray-600">
                    {clientes.length === 0 
                      ? "NO HAY CLIENTES REGISTRADOS" 
                      : "NO SE ENCONTRARON CLIENTES QUE COINCIDAN CON LOS CRITERIOS DE BÚSQUEDA"}
                  </p>
                </div>
              )}
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 mb-6">
                  <nav className="flex items-center space-x-1" aria-label="Pagination">
                    <button 
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">ANTERIOR</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {getPageNumbers().map((pageNumber, index) => (
                      pageNumber === '...' ? (
                        <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${pageNumber}`}
                          onClick={() => typeof pageNumber === 'number' && paginate(pageNumber)}
                          className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-red-600 border-red-600 text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          aria-current={currentPage === pageNumber ? 'page' : undefined}
                        >
                          {pageNumber}
                        </button>
                      )
                    ))}
                    
                    <button 
                      onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">SIGUIENTE</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientesUI;