import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../../../../js/urlHelper';
import { fetchWithAuth } from '../../../../js/authToken';

export default function ClienteSearch({ cliente, setCliente, setClienteId, error, setErrors, onClear }) {
  const [searchTerm, setSearchTerm] = useState(cliente || '');
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const dropdownRef = useRef(null);

  // Cargar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2 || searchTerm.trim() === '') {
        fetchClientes(searchTerm.trim());
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);


  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

    // Modificar el efecto para sincronizar el cliente externo
  useEffect(() => {
    // Si el cliente desde las props está vacío, limpiar la selección interna
    if (!cliente) {
      setSearchTerm('');
      setSelectedCliente(null);
    }
  }, [cliente]);

  // Función para obtener clientes
  const fetchClientes = async (search = '') => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/calculadora/clientes?search=${search}`);
      const data = await response.json();
      if (data.clientes) {
        setClientes(data.clientes);
        setShowDropdown(search.length > 0 && !selectedCliente);
      }
    } catch (error) {
      console.error('Error fetching clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar un cliente
  const handleSelectCliente = (cliente) => {
    const fullName = `${cliente.datos.nombre} ${cliente.datos.apellidoPaterno} ${cliente.datos.apellidoMaterno} ${cliente.datos.apellidoConyuge || ''}`.trim();
    setSearchTerm(fullName);
    setCliente(fullName);
    setClienteId(cliente.idUsuario);
    setSelectedCliente(cliente);
    setShowDropdown(false);
    setErrors(prev => ({ ...prev, cliente: '' }));
  };

  // Modificar handleClearSelection para ser más consistente
  const handleClearSelection = () => {
    setSearchTerm('');
    setSelectedCliente(null);
    setShowDropdown(false);
    setErrors(prev => ({ ...prev, cliente: '' }));
    
    // Actualizar los estados en el componente padre
    setCliente('');
    setClienteId(null);
    
    // Llamar a onClear si existe
    if (onClear) onClear();
  };

  // Manejar cambio en el input
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      handleClearSelection();
    }
  };

  // Manejar focus en el input
  const handleInputFocus = () => {
    if (!selectedCliente && (clientes.length > 0 || searchTerm.length > 0)) {
      setShowDropdown(true);
    }
  };

  // Obtener el email principal del cliente
  const getClienteEmail = (cliente) => {
    if (cliente.datos.contactos && Array.isArray(cliente.datos.contactos) && cliente.datos.contactos.length > 0) {
      // Buscar contacto principal o usar el primero
      const principalContacto = cliente.datos.contactos.find(contacto => contacto.tipo === 'PRINCIPAL') || cliente.datos.contactos[0];
      return principalContacto.email;
    }
    return "No disponible";
  };

  // Obtener el teléfono principal del cliente
  const getClienteTelefono = (cliente) => {
    if (cliente.datos.contactos && Array.isArray(cliente.datos.contactos) && cliente.datos.contactos.length > 0) {
      // Buscar contacto principal o usar el primero
      const principalContacto = cliente.datos.contactos.find(contacto => contacto.tipo === 'PRINCIPAL') || cliente.datos.contactos[0];
      return principalContacto.telefono;
    }
    return "No disponible";
  };

  return (
    <div className="mb-3 md:mb-6 bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200">
      <label className="flex flex-col w-full text-sm sm:text-base font-medium text-gray-700">
        CLIENTE
        <div className="relative mt-1 md:mt-2" ref={dropdownRef}>
          <div className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="BUSCAR CLIENTE..."
              disabled={!!selectedCliente}
            />
            {isLoading && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
            {selectedCliente && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                aria-label="Clear selection"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          {showDropdown && clientes.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm max-h-60">
              {clientes.map((cliente) => (
                <div
                  key={cliente.idUsuario}
                  className="cursor-pointer hover:bg-blue-50 px-4 py-2"
                  onClick={() => handleSelectCliente(cliente)}
                >
                  <div className="font-medium">
                    {cliente.datos.nombre} {cliente.datos.apellidoPaterno} {cliente.datos.apellidoMaterno} {cliente.datos.apellidoConyuge ? ` ${cliente.datos.apellidoConyuge}` : ''}
                  </div>
                  <div className="text-sm text-gray-500">
                    {cliente.datos.dni} - {getClienteEmail(cliente)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showDropdown && clientes.length === 0 && !isLoading && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              <div className="px-4 py-2 text-gray-500">NO SE ENCONTRARON CLIENTES</div>
            </div>
          )}
        </div>
        
        {selectedCliente && (
          <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800">
                  {selectedCliente.datos.nombre} {selectedCliente.datos.apellidoPaterno} {selectedCliente.datos.apellidoMaterno} {selectedCliente.datos.apellidoConyuge ? ` ${selectedCliente.datos.apellidoConyuge}` : ''}
                </h4>
                <div className="text-sm text-gray-600 mt-1">
                  <p>DNI: {selectedCliente.datos.dni}</p>
                  <p>EMAIL: {getClienteEmail(selectedCliente)}</p>
                  <p>TELÉFONO: {getClienteTelefono(selectedCliente)}</p>
                  {selectedCliente.datos.ruc && <p>RUC: {selectedCliente.datos.ruc}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Clear selection"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </label>
    </div>
  );
}