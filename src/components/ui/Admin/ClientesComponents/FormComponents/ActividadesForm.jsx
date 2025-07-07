import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../../../../../js/urlHelper';
import { fetchWithAuth } from '../../../../../js/authToken';

const ActividadesForm = ({ actividades = {}, errors = {}, onChange, isEditing = false }) => {
  const [searchText, setSearchText] = useState({ ciiu: '', noSensibles: '' });
  const [showDropdown, setShowDropdown] = useState({ ciiu: false, noSensibles: false });
  const [searchResults, setSearchResults] = useState({ ciiu: [], noSensibles: [] });
  const [selectedActivities, setSelectedActivities] = useState({
    ciiu: null,
    noSensibles: null,
  });
  const [loading, setLoading] = useState({ ciiu: false, noSensibles: false });
  const [isInputDisabled, setIsInputDisabled] = useState({
    ciiu: false,
    noSensibles: false,
  });

  const isInitialLoad = useRef(true);
  const ciiuRef = useRef(null);
  const noSensiblesRef = useRef(null);
  const searchTimeouts = useRef({ ciiu: null, noSensibles: null });

  // Inicialización segura y condicional
  useEffect(() => {
    const initializeActivities = async () => {
      let newCiiu = selectedActivities.ciiu;
      let newNoSensibles = selectedActivities.noSensibles;
      let ciiuDisabled = isInputDisabled.ciiu;
      let noSensiblesDisabled = isInputDisabled.noSensibles;

      // Handle ciiu activity
      if (actividades.ciiu && isInitialLoad.current) {
        if (
          typeof actividades.ciiu === 'object' &&
          actividades.ciiu.codigo &&
          actividades.ciiu.descripcion
        ) {
          newCiiu = actividades.ciiu;
          ciiuDisabled = isEditing;
        } else if (isEditing) {
          try {
            const response = await fetchWithAuth(
              `${API_BASE_URL}/api/admin/calculadora/actividades/ciiu?id=${actividades.ciiu}`
            );
            const data = await response.json();
            newCiiu = data.activity_ciiu?.data[0] || null;
            ciiuDisabled = isEditing && !!newCiiu;
          } catch (error) {
            console.error('Error al cargar actividad CIIU:', error);
          }
        }
      }

      // Handle non-sensitive activity
      if (actividades.noSensibles && isInitialLoad.current) {
        if (
          typeof actividades.noSensibles === 'object' &&
          actividades.noSensibles.sector &&
          actividades.noSensibles.actividad
        ) {
          newNoSensibles = actividades.noSensibles;
          noSensiblesDisabled = isEditing;
        } else if (isEditing) {
          try {
            const response = await fetchWithAuth(
              `${API_BASE_URL}/api/admin/calculadora/actividades/no-sensibles?id=${actividades.noSensibles}`
            );
            const data = await response.json();
            newNoSensibles = data.activity_no_sensible?.data[0] || null;
            noSensiblesDisabled = isEditing && !!newNoSensibles;
          } catch (error) {
            console.error('Error al cargar actividad no sensible:', error);
          }
        }
      }

      // Depuración: Inspeccionar valores antes de actualizar
      console.log('Inicializando actividades:', { newCiiu, newNoSensibles });

      // Solo actualizar el estado si hay cambios
      if (
        newCiiu !== selectedActivities.ciiu ||
        newNoSensibles !== selectedActivities.noSensibles
      ) {
        setSelectedActivities({
          ciiu: newCiiu,
          noSensibles: newNoSensibles,
        });
        // Solo llamar a onChange si los valores han cambiado
        if (newCiiu !== selectedActivities.ciiu) {
          console.log('Actualizando ciiu en onChange:', newCiiu);
          onChange('actividadesEconomicas.ciiu', newCiiu);
        }
        if (newNoSensibles !== selectedActivities.noSensibles) {
          console.log('Actualizando noSensibles en onChange:', newNoSensibles);
          onChange('actividadesEconomicas.noSensibles', newNoSensibles);
        }
      }

      if (
        ciiuDisabled !== isInputDisabled.ciiu ||
        noSensiblesDisabled !== isInputDisabled.noSensibles
      ) {
        setIsInputDisabled({
          ciiu: ciiuDisabled,
          noSensibles: noSensiblesDisabled,
        });
      }
    };

    initializeActivities();
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [actividades, isEditing, onChange, selectedActivities, isInputDisabled]);

  const searchActivities = async (field, searchValue) => {
    if (!searchValue.trim()) {
      setSearchResults((prev) => ({ ...prev, [field]: [] }));
      return;
    }

    setLoading((prev) => ({ ...prev, [field]: true }));
    try {
      const endpoint =
        field === 'ciiu'
          ? `${API_BASE_URL}/api/admin/calculadora/actividades/ciiu`
          : `${API_BASE_URL}/api/admin/calculadora/actividades/no-sensibles`;

      const response = await fetchWithAuth(`${endpoint}?search=${encodeURIComponent(searchValue)}`);
      const data = await response.json();

      const items =
        field === 'ciiu'
          ? data.activity_ciiu?.data || []
          : data.activity_no_sensible?.data || [];

      setSearchResults((prev) => ({ ...prev, [field]: items }));
    } catch (error) {
      console.error(`Error al buscar ${field}:`, error);
      setSearchResults((prev) => ({ ...prev, [field]: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSearchChange = (field, value) => {
    if (isInputDisabled[field]) return;
    setSearchText((prev) => ({ ...prev, [field]: value }));
    setShowDropdown((prev) => ({ ...prev, [field]: true }));

    clearTimeout(searchTimeouts.current[field]);
    searchTimeouts.current[field] = setTimeout(() => searchActivities(field, value), 300);
  };

  const handleSelectItem = (field, item) => {
    if (isInputDisabled[field] || !item) return;
    setSelectedActivities((prev) => ({ ...prev, [field]: item }));
    setSearchText((prev) => ({ ...prev, [field]: '' }));
    setShowDropdown((prev) => ({ ...prev, [field]: false }));
    setIsInputDisabled((prev) => ({ ...prev, [field]: isEditing }));

    // Depuración: Confirmar que se llama onChange
    console.log(`Seleccionando ${field}:`, item);
    onChange(`actividadesEconomicas.${field}`, item);
  };

  const handleRemoveItem = (field) => {
    setSelectedActivities((prev) => ({ ...prev, [field]: null }));
    setSearchText((prev) => ({ ...prev, [field]: '' }));
    setIsInputDisabled((prev) => ({ ...prev, [field]: false }));
    onChange(`actividadesEconomicas.${field}`, null);
  };

  const inputClass = (field) =>
    `w-full py-2 px-3 border rounded shadow focus:outline-none focus:shadow-outline ${
      errors[`actividadesEconomicas.${field}`] ? 'border-red-500' : 'border-gray-300'
    } ${isInputDisabled[field] ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`;

  // Manejo de cierre de dropdown SOLO cuando se da click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ciiuRef.current &&
        !ciiuRef.current.contains(event.target) &&
        noSensiblesRef.current &&
        !noSensiblesRef.current.contains(event.target)
      ) {
        setShowDropdown({ ciiu: false, noSensibles: false });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderSelectedActivity = (activity, field) => {
    if (!activity) return null;
    return (
      <div className="mt-2 p-3 bg-gray-50 rounded border flex justify-between items-center">
        <div>
          {field === 'ciiu' ? (
            <p className="font-medium">
              {activity.codigo} - {activity.descripcion}
            </p>
          ) : (
            <>
              <p className="font-medium">{activity.sector}</p>
              <p className="text-sm text-gray-600">{activity.actividad}</p>
            </>
          )}
        </div>
        <button
          onClick={() => handleRemoveItem(field)}
          className="text-red-500 hover:text-red-700 text-lg"
          aria-label={`ELIMINAR ACTIVIDAD SELECCIONADA DE ${field === 'ciiu' ? 'CIIU' : 'NO SENSIBLE'}`}
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center mb-4">
        <div className="w-2 h-8 bg-primary mr-3 rounded" />
        <h3 className="text-lg font-medium text-primary-600">ACTIVIDADES DEL CLIENTE</h3>
      </div>

      <p className="mb-4 text-sm font-bold text-gray-700">
        SELECCIONE 1 ACTIVIDAD CIIU Y 1 ACTIVIDAD NO SENSIBLE
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actividad CIIU */}
        <div className="relative" ref={ciiuRef}>
          <label className="block text-sm font-semibold mb-1 text-gray-600">
            ACTIVIDAD CIIU (1)
          </label>
          <input
            value={
              isInputDisabled.ciiu && selectedActivities.ciiu
                ? `${selectedActivities.ciiu.codigo} - ${selectedActivities.ciiu.descripcion}`
                : searchText.ciiu
            }
            onChange={(e) => handleSearchChange('ciiu', e.target.value)}
            onClick={(e) => {
              if (isInputDisabled.ciiu) return;
              e.stopPropagation();
              setShowDropdown((prev) => ({ ...prev, ciiu: true }));
            }}
            placeholder={
              isInputDisabled.ciiu
                ? ''
                : selectedActivities.ciiu
                ? 'BUSCAR OTRO CÓDIGO CIIU...'
                : 'SELECCIONE CÓDIGO CIIU (OBLIGATORIO)'
            }
            className={inputClass('ciiu')}
            disabled={isInputDisabled.ciiu}
            aria-label="BUSCAR ACTIVIDAD CIIU"
          />
          {errors['actividadesEconomicas.ciiu'] && (
            <span className="text-xs text-red-600 block mt-1 font-medium">
              {errors['actividadesEconomicas.ciiu']}
            </span>
          )}

          {!isInputDisabled.ciiu && showDropdown.ciiu && (
            <div
              className="absolute z-10 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded max-h-60 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {loading.ciiu ? (
                <div className="p-2 text-center text-gray-500">BUSCANDO...</div>
              ) : searchResults.ciiu.length > 0 ? (
                searchResults.ciiu.map((item) => (
                  <div
                    key={item.idCiiu}
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                    onClick={() => handleSelectItem('ciiu', item)}
                  >
                    <p className="font-medium">{item.codigo}</p>
                    <p className="text-sm text-gray-600">{item.descripcion}</p>
                    {item.riesgo && (
                      <p className="text-xs text-gray-500">RIESGO: {item.riesgo}</p>
                    )}
                  </div>
                ))
              ) : searchText.ciiu ? (
                <div className="p-2 text-center text-gray-500">NO SE ENCONTRARON RESULTADOS</div>
              ) : (
                <div className="p-2 text-center text-gray-500">ESCRIBA PARA BUSCAR</div>
              )}
            </div>
          )}

          {selectedActivities.ciiu && renderSelectedActivity(selectedActivities.ciiu, 'ciiu')}
        </div>
        {/* Actividad no sensible */}
        <div className="relative" ref={noSensiblesRef}>
          <label className="block text-sm font-semibold mb-1 text-gray-600">
            ACTIVIDAD NO SENSIBLE (1)
          </label>
          <input
            value={
              isInputDisabled.noSensibles && selectedActivities.noSensibles
                ? selectedActivities.noSensibles.actividad
                : searchText.noSensibles
            }
            onChange={(e) => handleSearchChange('noSensibles', e.target.value)}
            onClick={(e) => {
              if (isInputDisabled.noSensibles) return;
              e.stopPropagation();
              setShowDropdown((prev) => ({ ...prev, noSensibles: true }));
            }}
            placeholder={
              isInputDisabled.noSensibles
                ? ''
                : selectedActivities.noSensibles
                ? 'BUSCAR OTRA ACTIVIDAD...'
                : 'SELECCIONE ACTIVIDAD NO SENSIBLE'
            }
            className={inputClass('noSensibles')}
            disabled={isInputDisabled.noSensibles}
            aria-label="BUSCAR ACTIVIDAD NO SENSIBLE"
          />
          {errors['actividadesEconomicas.noSensibles'] && (
            <span className="text-xs text-red-600 block mt-1 font-medium">
              {errors['actividadesEconomicas.noSensibles']}
            </span>
          )}

          {!isInputDisabled.noSensibles && showDropdown.noSensibles && (
            <div
              className="absolute z-10 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded max-h-60 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {loading.noSensibles ? (
                <div className="p-2 text-center text-gray-500">BUSCANDO...</div>
              ) : searchResults.noSensibles.length > 0 ? (
                searchResults.noSensibles.map((item) => (
                  <div
                    key={item.idNoSensible}
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                    onClick={() => handleSelectItem('noSensibles', item)}
                  >
                    <p className="font-medium">{item.sector}</p>
                    <p className="text-sm text-gray-600">{item.actividad}</p>
                    <p className="text-xs text-gray-500">MARGEN: {item.margen_maximo}</p>
                  </div>
                ))
              ) : searchText.noSensibles ? (
                <div className="p-2 text-center text-gray-500">NO SE ENCONTRARON RESULTADOS</div>
              ) : (
                <div className="p-2 text-center text-gray-500">ESCRIBA PARA BUSCAR</div>
              )}
            </div>
          )}

          {selectedActivities.noSensibles &&
            renderSelectedActivity(selectedActivities.noSensibles, 'noSensibles')}
        </div>
      </div>
    </div>
  );
};

export default ActividadesForm;