import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../../../../js/urlHelper';
import { fetchWithAuth } from '../../../../js/authToken';

export default function AdvisorSearch({ selectedAdvisor, onSelect, onRemove, errors }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [advisors, setAdvisors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update search term when a selected advisor changes
  useEffect(() => {
    if (selectedAdvisor) {
      const advisorName = `${selectedAdvisor.datos?.nombre || ''} ${selectedAdvisor.datos?.apellidoPaterno || ''} ${selectedAdvisor.datos?.apellidoMaterno || ''} 
      ${selectedAdvisor.datos?.apellidoConyuge || ''}`.trim();
      setSearchTerm(advisorName);
    } else {
      setSearchTerm('');
    }
  }, [selectedAdvisor]);

  useEffect(() => {
    // Only search if there's a term and it's at least 2 characters
    if (searchTerm.length >= 2 && !selectedAdvisor) {
      searchAdvisors();
    } else if (!selectedAdvisor) {
      setAdvisors([]);
      setShowResults(searchTerm.length >= 2);
    }
  }, [searchTerm, selectedAdvisor]);

  const searchAdvisors = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/calculadora/asesores?search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setAdvisors(data.asesores || []);
        setShowResults(true);
      } else {
        console.error('Error fetching advisors');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAdvisor = (advisor) => {
    onSelect(advisor);
    setShowResults(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (selectedAdvisor) {
      // If there's a selected advisor but the user is typing, clear the selection
      onRemove();
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setShowResults(true);
    }
  };

  return (
    <div className="relative" ref={searchContainerRef}>
      {!selectedAdvisor ? (
        // Mostrar input de búsqueda cuando no hay asesor seleccionado
        <div className="flex flex-col">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="BUSCAR ASESOR..."
              className={`border-2 ${errors ? 'border-red-500' : 'border-gray-300'
                } focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50 px-2 py-1 md:py-2 rounded-lg w-full text-sm`}
            />
          </div>
        </div>
      ) : (
        // Mostrar asesor seleccionado
        <div className="p-2 bg-gray-100 border border-gray-300 rounded-lg flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">ASESOR SELECCIONADO: </span>
            <span>{selectedAdvisor.datos?.nombre || ''} {selectedAdvisor.datos?.apellidoPaterno || ''} {selectedAdvisor.datos?.apellidoMaterno || ''} {selectedAdvisor.datos?.apellidoConyuge || ''}</span>
            {selectedAdvisor.datos?.dni && <span className="text-gray-500 ml-1">- {selectedAdvisor.datos.dni}</span>}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 font-bold text-lg px-2"
            aria-label="Remover asesor"
          >
            ×
          </button>
        </div>
      )}

      {/* Search results */}
      {showResults && !selectedAdvisor && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-center text-gray-500">CARGANDO...</div>
          ) : advisors.length > 0 ? (
            <ul>
              {advisors.map((advisor) => (
                <li
                  key={advisor.id || `advisor-${advisor.datos?.dni || Math.random()}`}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSelectAdvisor(advisor)}
                >
                  {advisor.datos?.nombre || ''} {advisor.datos?.apellidoPaterno || ''} {advisor.datos?.apellidoMaterno || ''}{advisor.datos?.apellidoConyuge ? ` ${advisor.datos.apellidoConyuge}` : ''}{advisor.datos?.dni ? ` - ${advisor.datos.dni}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-center text-gray-500">NO SE ENCONTRARON ASESORES</div>
          )}
        </div>
      )}

      {errors && <p className="text-red-500 text-sm mt-1">{errors}</p>}
    </div>
  );
}