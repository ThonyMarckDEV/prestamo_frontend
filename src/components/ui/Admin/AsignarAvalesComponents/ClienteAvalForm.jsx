import React, { useState } from 'react';

const ClienteAvalForm = ({ clientes, avales, clienteHasAval, clientesConAval, onAsignarAval }) => {
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedAval, setSelectedAval] = useState('');
  const [searchClienteName, setSearchClienteName] = useState('');
  const [searchAvalName, setSearchAvalName] = useState('');
  const [error, setError] = useState('');

 
  const filteredClientes = clientes.filter(cliente => {
    if (!searchClienteName) return true;
  
    const datos = cliente.datos || {};
    const nombreCompleto = `${datos.nombre || ''} ${datos.apellido || ''}`.toLowerCase();
    const dni = datos.dni?.toLowerCase() || '';
    const ruc = datos.ruc?.toLowerCase() || '';
  
    const search = searchClienteName.toLowerCase();
    return (
      nombreCompleto.includes(search) ||
      dni.includes(search) ||
      ruc.includes(search)
    );
  });


  const filteredAvales = avales.filter(aval => {
    if (!searchAvalName) return true;
  
    const datos = aval.datos || {};
    const nombreCompleto = `${datos.nombre || ''} ${datos.apellido || ''}`.toLowerCase();
    const dni = datos.dni?.toLowerCase() || '';
    const ruc = datos.ruc?.toLowerCase() || '';
  
    const search = searchAvalName.toLowerCase();
    return (
      nombreCompleto.includes(search) ||
      dni.includes(search) ||
      ruc.includes(search)
    );
  });

  const handleClienteChange = (e) => {
    setSelectedCliente(e.target.value);
  };

  const handleAvalChange = (e) => {
    setSelectedAval(e.target.value);
  };
  
  const handleSearchClienteChange = (e) => {
    setSearchClienteName(e.target.value);
  };
  
  const handleSearchAvalChange = (e) => {
    setSearchAvalName(e.target.value);
  };

  // Verificar si un aval ha alcanzado el límite máximo de clientes (2)
  const avalReachedLimit = (avalId) => {
    const count = clientesConAval(avalId);
    return count >= 2; // Límite de 2 clientes por aval
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedCliente || !selectedAval) {
      setError('DEBE SELECCIONAR UN CLIENTE Y UN AVAL PARA CONTINUAR');
      return;
    }
    
    if (clienteHasAval(selectedCliente)) {
      setError('ESTE CLIENTE YA TIENE UN AVAL ASIGNADO. ELIMINE LA ASIGNACIÓN ACTUAL ANTES DE ASIGNAR UN NUEVO AVAL');
      return;
    }
  
    onAsignarAval(selectedCliente, selectedAval);
  
    // Resetear selecciones y campos de búsqueda
    setSelectedCliente('');
    setSelectedAval('');
    setSearchClienteName('');
    setSearchAvalName('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg border-l-4 border-primary">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cliente" className="block text-gray-700 font-medium mb-2">
            CLIENTE
          </label>
          <div className="mb-2">
            <input
              type="text"
              placeholder="BUSCAR CLIENTE POR NOMBRE, APELLIDOS, DNI O RUC..."
              value={searchClienteName}
              onChange={handleSearchClienteChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 mb-2"
            />
          </div>
          <select
            id="cliente"
            value={selectedCliente}
            onChange={handleClienteChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="">-- SELECCIONE UN CLIENTE --</option>
            {filteredClientes.map((cliente) => (
              <option
                key={cliente.idUsuario}
                value={cliente.idUsuario}
                disabled={clienteHasAval(cliente.idUsuario)}
              >
                {cliente.datos ? `${cliente.datos.nombre} ${cliente.datos.apellidoPaterno} ${cliente.datos.apellidoMaterno}` : cliente.username} 
                {clienteHasAval(cliente.idUsuario) ? ' (Ya tiene aval)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="aval" className="block text-gray-700 font-medium mb-2">
            AVAL
          </label>
          <div className="mb-2">
            <input
              type="text"
              placeholder="BUSCAR AVAL POR NOMBRE, APELLIDOS, DNI O RUC..."
              value={searchAvalName}
              onChange={handleSearchAvalChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 mb-2"
            />
          </div>
          <select
            id="aval"
            value={selectedAval}
            onChange={handleAvalChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="">-- SELECCIONE UN AVAL --</option>
            {filteredAvales.map((aval) => (
              <option 
                key={aval.idUsuario} 
                value={aval.idUsuario}
                disabled={avalReachedLimit(aval.idUsuario)}
              >
                {aval.datos ? `${aval.datos.nombre} ${aval.datos.apellidoPaterno} ${aval.datos.apellidoMaterno}` : aval.username} 
                {clientesConAval(aval.idUsuario) > 0 ? ` (${clientesConAval(aval.idUsuario)} cliente${clientesConAval(aval.idUsuario) > 1 ? 's' : ''})` : ''}
                {avalReachedLimit(aval.idUsuario) ? ' (Límite alcanzado)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="mt-6">
        <button
          type="submit"
          className="bg-primary-light hover:bg-primary-dark text-white py-2 px-6 rounded-lg font-medium transition duration-300"
        >
          ASIGNAR AVAL
        </button>
      </div>
    </form>
  );
};

export default ClienteAvalForm;