import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';

import ClienteAvalForm from './ClienteAvalForm';
import AsignacionesTable from './AsignacionesTable';

const ClienteAvales = () => {
  const [clientes, setClientes] = useState([]);
  const [avales, setAvales] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [filteredAsignaciones, setFilteredAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch clientes (con aval=false)
        const clientesResponse = await fetchWithAuth(`${API_BASE_URL}/api/admin/asignacion/getclientes`);
        const clientesData = await clientesResponse.json();
        setClientes(clientesData);

        // Fetch avales (usuarios con aval=true)
        const avalesResponse = await fetchWithAuth(`${API_BASE_URL}/api/admin/asignacion/getavales`);
        const avalesData = await avalesResponse.json();
        setAvales(avalesData);

        // Fetch asignaciones existentes
        const asignacionesResponse = await fetchWithAuth(`${API_BASE_URL}/api/admin/asignacion/clienteavales`);
        const asignacionesData = await asignacionesResponse.json();
        setAsignaciones(asignacionesData);
        setFilteredAsignaciones(asignacionesData);
      } catch (error) {
        setError('Error al cargar datos. Intente nuevamente.');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAsignarAval = async (idCliente, idAval) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/asignacion/clienteavales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idCliente,
          idAval,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Actualizar lista de asignaciones
        const asignacionesResponse = await fetchWithAuth(`${API_BASE_URL}/api/admin/asignacion/clienteavales`);
        const asignacionesData = await asignacionesResponse.json();
        setAsignaciones(asignacionesData);
        setFilteredAsignaciones(asignacionesData);
        
        setSuccess('Asignación realizada correctamente');
        setError('');
      } else {
        setError(data.message || 'Error al realizar la asignación');
      }
    } catch (error) {
      setError('Error en el servidor. Intente nuevamente.');
      console.error('Error:', error);
    }
  };

  const handleEliminarAsignacion = async (id) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/asignacion/clienteavales/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Actualizar lista de asignaciones
        const updatedAsignaciones = asignaciones.filter(asignacion => asignacion.id !== id);
        setAsignaciones(updatedAsignaciones);
        setFilteredAsignaciones(updatedAsignaciones);
        setSuccess('Asignación eliminada correctamente');
      } else {
        setError('Error al eliminar la asignación');
      }
    } catch (error) {
      setError('Error en el servidor. Intente nuevamente.');
      console.error('Error:', error);
    }
  };

  const handleFilterAsignaciones = (searchTerm) => {
    if (!searchTerm) {
      setFilteredAsignaciones(asignaciones);
      return;
    }
    
    const filteredResults = asignaciones.filter(asignacion => {
      const clienteNombre = asignacion.cliente?.nombreCompleto?.toLowerCase() || '';
      const avalNombre = asignacion.aval?.nombreCompleto?.toLowerCase() || '';
      
      return clienteNombre.includes(searchTerm.toLowerCase()) || 
             avalNombre.includes(searchTerm.toLowerCase());
    });
    
    setFilteredAsignaciones(filteredResults);
  };

  // Cliente ya tiene un aval asignado?
  const clienteHasAval = (clienteId) => {
    return asignaciones.some(asignacion => asignacion.idCliente === parseInt(clienteId));
  };

  // Cuántos clientes tienen este aval?
  const clientesConAval = (avalId) => {
    return asignaciones.filter(asignacion => asignacion.idAval === parseInt(avalId)).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-red-600 mb-2">ASIGNACIÓN DE AVALES A CLIENTES</h1>
        <p className="text-gray-600">SELECCIONE UN CLIENTE Y UN AVAL PARA REALIZAR LA ASIGNACIÓN. UN CLIENTE PUEDE TENER UN AVAL Y UN AVAL HASTA 2 CLIENTES ASIGNADOS</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <ClienteAvalForm 
          clientes={clientes}
          avales={avales}
          clienteHasAval={clienteHasAval}
          clientesConAval={clientesConAval}
          onAsignarAval={handleAsignarAval}
        />
        
        <AsignacionesTable 
          asignaciones={filteredAsignaciones}
          loading={loading}
          onFilterAsignaciones={handleFilterAsignaciones}
          onEliminarAsignacion={handleEliminarAsignacion}
        />
      </div>
    </div>
  );
};

export default ClienteAvales;