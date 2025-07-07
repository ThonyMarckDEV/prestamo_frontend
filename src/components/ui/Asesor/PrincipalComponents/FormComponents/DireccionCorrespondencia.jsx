const fields = [
  { key: 'tipoVia', label: 'TIPO DE VÍA', type: 'select' },
  { key: 'nombreVia', label: 'NOMBRE DE VÍA', type: 'text', placeholder: 'Ej: LOS LAURELES', autoComplete: 'address-line1' },
  { key: 'numeroMz', label: 'N°/MZ-LT', type: 'text', placeholder: 'Ej: 123, MZ A LT 1', maxLength: 10 },
  { key: 'urbanizacion', label: 'URBANIZACIÓN/CASERÍO', type: 'text', placeholder: 'Ej: CHOCÁN, LA ORCA', autoComplete: 'address-line2' },
];

const tipoViaOptions = [
  { value: '', label: 'SELECCIONE...' },
  { value: 'CALLE', label: 'CALLE' },
  { value: 'AV.', label: 'AV.' },
  { value: 'JR.', label: 'JR.' },
  { value: 'TRANSVERSAL', label: 'TRANSVERSAL' },
  { value: 'RURAL', label: 'RURAL' },
];
const formatNombre = (nombre) => {
  return nombre
    .replace(/_/g, ' ')
};

// DireccionCorrespondencia.jsx
const DireccionCorrespondencia = ({ direccion, peruData, errors, onChange }) => {
  console.log('DireccionCorrespondencia props:', { direccion, peruData, errors });

  // Guard para direccion
  if (!direccion) {
    console.error('DireccionCorrespondencia: direccion prop is undefined or null');
    return (
      <div className="bg-accent-yellow-50 border border-accent-yellow-200 text-accent-copper-600 px-4 py-3 rounded mb-4">
        Error: Dirección de correspondencia no disponible
      </div>
    );
  }

  // Guard para peruData
  if (!peruData || typeof peruData !== 'object' || Object.keys(peruData).length === 0) {
    console.error('DireccionCorrespondencia: peruData is undefined, null, or empty', peruData);
    return (
      <div className="bg-accent-yellow-50 border border-accent-yellow-200 text-accent-copper-600 px-4 py-3 rounded mb-4">
        Error: Datos de Perú no disponibles
      </div>
    );
  }

  const inputClass = (field) =>
    `shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
      errors[`direccionCorrespondencia.${field}`] ? 'border-red-500' : 'border-primary-600'
    }`;

  const handleDepartamentoChange = (e) => {
    onChange("direccionCorrespondencia.departamento", e.target.value);
    onChange("direccionCorrespondencia.provincia", "");
    onChange("direccionCorrespondencia.distrito", "");
  };

  const handleProvinciaChange = (e) => {
    onChange("direccionCorrespondencia.provincia", e.target.value);
    onChange("direccionCorrespondencia.distrito", "");
  };

  const handleUppercaseChange = (name, value) => {
    onChange(name, value.toUpperCase());
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-2 h-8 bg-primary mr-3 rounded" />
        <h3 className="text-lg font-medium text-primary-600">DIRECCIÓN DE CORRESPONDENCIA/NEGOCIO</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map(({ key, label, type, placeholder, autoComplete, maxLength }) => (
          <div key={key}>
            <label htmlFor={`direccionCorrespondencia-${key}`} className="block text-sm font-bold mb-1">{label}</label>
            {type === 'select' ? (
              <select
                id={`direccionCorrespondencia-${key}`}
                name={`direccionCorrespondencia.${key}`}
                value={direccion?.[key] || ''}
                onChange={(e) => onChange(e.target.name, e.target.value)}
                className={inputClass(key)}
                aria-invalid={!!errors[`direccionCorrespondencia.${key}`]}
              >
                {tipoViaOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                id={`direccionCorrespondencia-${key}`}
                name={`direccionCorrespondencia.${key}`}
                value={direccion?.[key] || ''}
                onChange={e => handleUppercaseChange(e.target.name, e.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                maxLength={maxLength}
                className={inputClass(key)}
                aria-invalid={!!errors[`direccionCorrespondencia.${key}`]}
                style={{ textTransform: 'uppercase' }}
              />
            )}
            {errors[`direccionCorrespondencia.${key}`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`direccionCorrespondencia.${key}`]}</p>
            )}
          </div>
        ))}

        {/* Departamento */}
        <div>
          <label htmlFor="direccionCorrespondencia-departamento" className="block text-sm font-bold mb-1">DEPARTAMENTO</label>
          <select
            id="direccionCorrespondencia-departamento"
            name="direccionCorrespondencia.departamento"
            value={direccion?.departamento || ''}
            onChange={handleDepartamentoChange}
            className={inputClass('departamento')}
            aria-invalid={!!errors['direccionCorrespondencia.departamento']}
          >
            <option value="">SELECCIONE...</option>
            {peruData && Object.keys(peruData).length > 0 ? (
              Object.keys(peruData).map(depto => (
                <option key={depto} value={depto}>{formatNombre(depto)}</option>
              ))
            ) : (
              <option value="" disabled>No hay departamentos disponibles</option>
            )}
          </select>
          {errors['direccionCorrespondencia.departamento'] && (
            <p className="text-red-500 text-xs mt-1">{errors['direccionCorrespondencia.departamento']}</p>
          )}
        </div>

        {/* Provincia */}
        <div>
          <label htmlFor="direccionCorrespondencia-provincia" className="block text-sm font-bold mb-1">PROVINCIA</label>
          <select
            id="direccionCorrespondencia-provincia"
            name="direccionCorrespondencia.provincia"
            value={direccion?.provincia || ''}
            onChange={handleProvinciaChange}
            disabled={!direccion?.departamento || !peruData[direccion.departamento]}
            className={inputClass('provincia')}
            aria-invalid={!!errors['direccionCorrespondencia.provincia']}
          >
            <option value="">SELECCIONE...</option>
            {direccion?.departamento && peruData[direccion.departamento] ? (
              Object.keys(peruData[direccion.departamento]).map(prov => (
                <option key={prov} value={prov}>{formatNombre(prov)}</option>
              ))
            ) : (
              <option value="" disabled>Seleccione un departamento primero</option>
            )}
          </select>
          {errors['direccionCorrespondencia.provincia'] && (
            <p className="text-red-500 text-xs mt-1">{errors['direccionCorrespondencia.provincia']}</p>
          )}
        </div>

        {/* Distrito */}
        <div>
          <label htmlFor="direccionCorrespondencia-distrito" className="block text-sm font-bold mb-1">DISTRITO</label>
          <select
            id="direccionCorrespondencia-distrito"
            name="direccionCorrespondencia.distrito"
            value={direccion?.distrito || ''}
            onChange={e => onChange(e.target.name, e.target.value)}
            disabled={!direccion?.provincia || !peruData[direccion.departamento]?.[direccion.provincia]}
            className={inputClass('distrito')}
            aria-invalid={!!errors['direccionCorrespondencia.distrito']}
          >
            <option value="">SELECCIONE...</option>
            {direccion?.departamento && direccion?.provincia && peruData[direccion.departamento]?.[direccion.provincia] ? (
              peruData[direccion.departamento][direccion.provincia].map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))
            ) : (
              <option value="" disabled>Seleccione una provincia primero</option>
            )}
          </select>
          {errors['direccionCorrespondencia.distrito'] && (
            <p className="text-red-500 text-xs mt-1">{errors['direccionCorrespondencia.distrito']}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DireccionCorrespondencia;