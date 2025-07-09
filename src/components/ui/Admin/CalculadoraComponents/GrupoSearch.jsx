import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../../../../js/urlHelper';
import { fetchWithAuth } from '../../../../js/authToken';

export default function GrupoSearch({ selectedGroup, onSelect, onRemove, errors }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
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

  // Update search term when a selected group changes
  useEffect(() => {
    if (selectedGroup) {
      setSearchTerm(selectedGroup.nombre || '');
    } else {
      setSearchTerm('');
    }
  }, [selectedGroup]);

  // Search groups when search term changes
  useEffect(() => {
    if (searchTerm.length >= 2 && !selectedGroup) {
      searchGroups();
    } else if (!selectedGroup) {
      setGroups([]);
      setShowResults(searchTerm.length >= 2);
    }
  }, [searchTerm, selectedGroup]);

  const searchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/grupos?search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data = await response.json();
        setGroups(data.grupos || []);
        setShowResults(true);
      } else {
        console.error('Error fetching groups');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGroup = (group) => {
    onSelect({
      idGrupo: group.idGrupo,
      nombre: group.nombre,
      idAsesor: group.idAsesor,
      asesor: group.asesor
    });
    setShowResults(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (selectedGroup) {
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
      {!selectedGroup ? (
        // Show search input when no group is selected
        <div className="flex flex-col">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="BUSCAR GRUPO POR ID O NOMBRE..."
              className={`border-2 ${errors ? 'border-red-500' : 'border-gray-300'} focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50 px-2 py-1 md:py-2 rounded-lg w-full text-sm`}
            />
          </div>
        </div>
      ) : (
        // Show selected group
        <div className="p-2 bg-gray-100 border border-gray-300 rounded-lg flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">GRUPO SELECCIONADO: </span>
            <span>{selectedGroup.nombre} (ID: {selectedGroup.idGrupo})</span>
            {selectedGroup.asesor?.datos && (
              <span className="text-gray-500 ml-1">
                - Asesor: {selectedGroup.asesor.datos.nombre} {selectedGroup.asesor.datos.apellidoPaterno || ''} {selectedGroup.asesor.datos.apellidoMaterno || ''}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 font-bold text-lg px-2"
            aria-label="Remover grupo"
          >
            ×
          </button>
        </div>
      )}

      {/* Search results */}
      {showResults && !selectedGroup && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-center text-gray-500">CARGANDO...</div>
          ) : groups.length > 0 ? (
            <ul>
              {groups.map((group) => (
                <li
                  key={group.idGrupo}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSelectGroup(group)}
                >
                  {group.nombre} (ID: {group.idGrupo})
                  {group.asesor?.datos && (
                    <span className="text-gray-500">
                      {' - Asesor: '}
                      {group.asesor.datos.nombre} {group.asesor.datos.apellidoPaterno || ''} {group.asesor.datos.apellidoMaterno || ''}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-center text-gray-500">NO SE ENCONTRARON GRUPOS</div>
          )}
        </div>
      )}

      {errors && <p className="text-red-500 text-sm mt-1">{errors}</p>}
    </div>
  );
}