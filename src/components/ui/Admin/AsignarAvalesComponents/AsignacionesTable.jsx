import React, { useState, useEffect } from 'react';
import Pagination from './Pagination';

const AsignacionesTable = ({ asignaciones, loading, onFilterAsignaciones, onEliminarAsignacion }) => {
  const [searchAsignacion, setSearchAsignacion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    onFilterAsignaciones(searchAsignacion);
  }, [searchAsignacion]);
  
  const handleSearchAsignacionChange = (e) => {
    setSearchAsignacion(e.target.value);
    setCurrentPage(1); // Resetear a primera página al buscar
  };
  
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Resetear a primera página
  };
  
  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = asignaciones.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(asignaciones.length / itemsPerPage);
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">ASIGNACIONES ACTUALES</h2>
      
      {/* Buscador de asignaciones */}
      <div className="flex flex-col md:flex-row md:items-center mb-4 space-y-2 md:space-y-0">
        <div className="flex-1">
          <input
            type="text"
            placeholder="BUSCAR ASIGNACIÓN POR NOMBRE DE CLIENTE O AVAL..."
            value={searchAsignacion}
            onChange={handleSearchAsignacionChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="md:ml-4">
          <select 
            value={itemsPerPage} 
            onChange={handleItemsPerPageChange}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="5">5 POR PÁGINA</option>
            <option value="10">10 POR PÁGINA</option>
            <option value="20">20 POR PÁGINA</option>
            <option value="50">50 POR PÁGINA</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-4">CARGANDO ASIGNACIONES...</div>
      ) : asignaciones.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {searchAsignacion ? 'No se encontraron resultados para la búsqueda' : 'No hay asignaciones registradas'}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLIENTE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AVAL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FECHA DE ASIGNACIÓN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((asignacion) => (
                  <tr key={asignacion.id} className="hover:bg-yellow-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asignacion.cliente ? asignacion.cliente.nombreCompleto : 'Cliente no encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asignacion.aval ? asignacion.aval.nombreCompleto : 'Aval no encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(asignacion.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onEliminarAsignacion(asignacion.id)}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        ELIMINAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={asignaciones.length}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default AsignacionesTable;