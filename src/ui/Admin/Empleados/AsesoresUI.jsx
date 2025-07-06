import React, { useState, useEffect } from 'react';
import FormAsesores from '../../../components/ui/Admin/AsesoresComponents/FormAsesores';
import AsesoresCard from '../../../components/ui/Admin/AsesoresComponents/AsesoresCard';
import SkeletonAsesorCard from '../../../components/ui/Admin/AsesoresComponents/LoadingSkeletons/SkeletonLoadingAsesorCard';
import { fetchWithAuth } from '../../../js/authToken';
import API_BASE_URL from '../../../js/urlHelper';

const AsesoresUI = () => {
  const [asesores, setAsesores] = useState([]);
  const [filteredAsesores, setFilteredAsesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAsesor, setEditingAsesor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all'); // New state for role filter
  const asesoresPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAsesores();
  }, []);

  useEffect(() => {
    filterAsesores();
  }, [asesores, searchTerm, statusFilter, roleFilter]);

  const fetchAsesores = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/asesores/getasesores`);
      if (!response.ok) throw new Error('Error al cargar asesores');
      const data = await response.json();
      setAsesores(data.asesores);
      setFilteredAsesores(data.asesores);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los asesores.');
    } finally {
      setLoading(false);
    }
  };

  const filterAsesores = () => {
    let result = [...asesores];

    // Filtrar por estado
    if (statusFilter !== 'all') {
      result = result.filter(asesor => asesor.estado === parseInt(statusFilter));
    }

    // Filtrar por rol
    if (roleFilter !== 'all') {
      result = result.filter(asesor => asesor.idRol === parseInt(roleFilter));
    }

    // Filtrar por término de búsqueda flexible
    if (searchTerm) {
      const termWords = searchTerm.toLowerCase().split(/\s+/); // Divide en palabras
      result = result.filter(asesor => {
        const nombre = asesor.datos?.nombre?.toLowerCase() || '';
        const apellidoPaterno = asesor.datos?.apellidoPaterno?.toLowerCase() || '';
        const apellidoMaterno = asesor.datos?.apellidoMaterno?.toLowerCase() || '';
        const email = asesor.datos?.contactos?.[0]?.email?.toLowerCase() || '';
        
        const fullText = `${nombre} ${apellidoPaterno} ${apellidoMaterno} ${email}`.toLowerCase();
        
        // Verificar si TODAS las palabras del searchTerm están en alguna parte del texto completo
        return termWords.every(word => fullText.includes(word));
      });
    }

    setFilteredAsesores(result);
    setCurrentPage(1);
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all'); // Reset role filter
  };

  const handleAsesorAdded = (nuevo) => {
    setAsesores([nuevo, ...asesores]);
    resetForm();
  };

  const handleAsesorUpdated = (actualizado) => {
    setAsesores(asesores.map(asesor => asesor.idUsuario === actualizado.idUsuario ? actualizado : asesor));
    resetForm();
  };

  const handleStatusChange = (id, nuevoEstado) => {
    setAsesores(asesores.map(asesor => asesor.idUsuario === id ? { ...asesor, estado: nuevoEstado } : asesor));
  };

  const handleEditAsesor = (asesor) => {
    setIsEditing(true);
    setEditingAsesor(asesor);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingAsesor(null);
    setShowForm(false);
  };

  const toggleForm = () => {
    if (isEditing) resetForm();
    else {
      setShowForm(!showForm);
      if (!showForm) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Pagination
  const indexOfLastAsesor = currentPage * asesoresPerPage;
  const indexOfFirstAsesor = indexOfLastAsesor - asesoresPerPage;
  const currentAsesores = filteredAsesores.slice(indexOfFirstAsesor, indexOfLastAsesor);
  const totalPages = Math.ceil(filteredAsesores.length / asesoresPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end page numbers to display
      let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
      
      // Adjust startPage if endPage is at maximum limit
      if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - (maxVisiblePages - 3));
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle page numbers
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-gray-100">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-red-800">GESTIÓN DE EMPLEADOS</h1>
            <button
              onClick={toggleForm}
              className={`${
                isEditing || showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              } text-white font-bold py-2 px-4 rounded flex items-center w-full sm:w-auto justify-center`}
            >
              {isEditing ? 'CANCELAR EDICIÓN' : (showForm ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  CERRAR FORMULARIO
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  AGREGAR NUEVO EMPLEADO
                </>
              ))}
            </button>
          </div>

          {showForm && (
            <div className="mb-4 bg-white rounded shadow border-t-4 border-red-600">
              <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white p-3 rounded-t font-semibold flex justify-between items-center">
                <h2 className="text-lg font-bold">{isEditing ? 'EDITAR EMPLEADO' : 'AGREGAR NUEVO EMPLEADO'}</h2>
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
                <FormAsesores
                  onAsesorAdded={handleAsesorAdded}
                  onAsesorUpdated={handleAsesorUpdated}
                  initialData={editingAsesor}
                  isEditing={isEditing}
                  onCancel={resetForm}
                />
              </div>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  BUSCAR EMPLEADOS
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
                    placeholder="BUSCAR POR NOMBRE, APELLIDOS O EMAIL..."
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

              {/* Role Filter */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  FILTRAR POR ROL
                </label>
                <select
                  id="role"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm py-2 border"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">TODOS LOS ROLES</option>
                  <option value="3">ASESOR</option>
                  <option value="4">AUDITOR</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end md:col-span-3">
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

          {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

          {/* Results count display */}
          {!loading && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
              <h2 className="text-lg font-semibold text-red-800 mb-1 sm:mb-0">LISTADO DE EMPLEADOS</h2>
              <div className="text-sm text-gray-600">
                {filteredAsesores.length > 0 ? (
                  `MOSTRANDO ${indexOfFirstAsesor + 1} - ${Math.min(indexOfLastAsesor, filteredAsesores.length)} DE ${filteredAsesores.length}`
                ) : (
                  "NO HAY EMPLEADOS QUE COINCIDAN CON LOS FILTROS"
                )}
              </div>
            </div>
          )}

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill().map((_, index) => <SkeletonAsesorCard key={index} />)}
            </div>
          ) : filteredAsesores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentAsesores.map(asesor => (
                <AsesoresCard
                  key={asesor.idUsuario}
                  asesor={asesor}
                  onStatusChange={handleStatusChange}
                  onEdit={() => handleEditAsesor(asesor)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-600">
                {asesores.length === 0 
                  ? "NO HAY EMPLEADOS REGISTRADOS" 
                  : "NO SE ENCONTRARON EMPLEADOS QUE COINCIDAN CON LOS CRITERIOS DE BÚSQUEDA."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 mb-6">
              <nav className="flex items-center space-x-1" aria-label="Pagination">
                {/* Previous page button */}
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
                
                {/* Page numbers */}
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
                
                {/* Next page button */}
                <button 
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AsesoresUI;