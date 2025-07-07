const fields = [
  { key: 'tipoVia', label: 'TIPO DE VÍA', type: 'select' },
  { key: 'nombreVia', label: 'NOMBRE DE VÍA', type: 'text', placeholder: 'Ej: LOS LAURELES', autoComplete: 'address-line1' },
  { key: 'numeroMz', label: 'N°/MZ-LT', type: 'text', placeholder: 'Ej: 123 / MZ A LT 1', maxLength: 10 },
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
  return nombre.replace(/_/g, ' ');
};

const DireccionFiscal = ({ direccion, peruData, errors, onChange }) => {
  // Guard for direccion
  if (!direccion) {
    console.error('DireccionFiscal: direccion prop is undefined or null');
    return (
      <div className="bg-accent-yellow-50 border border-accent-yellow-200 text-accent-copper-600 px-4 py-3 rounded mb-4">
        Error: Dirección fiscal no disponible
      </div>
    );
  }

  // Guard for peruData
  if (!peruData || typeof peruData !== 'object') {
    console.error('DireccionFiscal: peruData is undefined, null, or not an object');
    return (
      <div className="bg-accent-yellow-50 border border-accent-yellow-200 text-accent-copper-600 px-4 py-3 rounded mb-4">
        Error: Datos de Perú no disponibles
      </div>
    );
  }

  const inputClass = (field) =>
    `shadow appearance-none border rounded w-full py-3 px-4 text-primary-800 leading-tight focus:outline-none focus:shadow-outline ${
      errors[`direccionFiscal.${field}`] ? 'border-accent-copper-600' : 'border-accent-yellow-300'
    }`;

  const handleDepartamentoChange = (e) => {
    onChange("direccionFiscal.departamento", e.target.value);
    onChange("direccionFiscal.provincia", "");
    onChange("direccionFiscal.distrito", "");
  };

  const handleProvinciaChange = (e) => {
    onChange("direccionFiscal.provincia", e.target.value);
    onChange("direccionFiscal.distrito", "");
  };

  const handleUppercaseChange = (name, value) => {
    onChange(name, value.toUpperCase());
  };

  return (
    <div className="bg-neutral-white shadow-md rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-2 h-8 bg-accent-copper-600 mr-3 rounded" />
        <h3 className="text-lg font-medium text-accent-copper-800">DIRECCIÓN FISCAL (DNI)</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map(({ key, label, type, placeholder, autoComplete, maxLength }) => (
          <div key={key}>
            <label htmlFor={`direccionFiscal-${key}`} className="block text-sm font-bold text-accent-steel-600 mb-1">{label}</label>
            {type === 'select' ? (
              <select
                id={`direccionFiscal-${key}`}
                name={`direccionFiscal.${key}`}
                value={direccion[key] || ''}
                onChange={(e) => onChange(e.target.name, e.target.value)}
                className={inputClass(key)}
                aria-invalid={!!errors[`direccionFiscal.${key}`]}
              >
                {tipoViaOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                id={`direccionFiscal-${key}`}
                name={`direccionFiscal.${key}`}
                value={direccion[key] || ''}
                onChange={e => handleUppercaseChange(e.target.name, e.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                maxLength={maxLength}
                className={inputClass(key)}
                aria-invalid={!!errors[`direccionFiscal.${key}`]}
                style={{ textTransform: 'uppercase' }}
              />
            )}
            {errors[`direccionFiscal.${key}`] && (
              <p className="text-accent-copper-600 text-xs mt-1">{errors[`direccionFiscal.${key}`]}</p>
            )}
          </div>
        ))}

        {/* Departamento */}
        <div>
          <label htmlFor="direccionFiscal-departamento" className="block text-sm font-bold text-accent-steel-600 mb-1">DEPARTAMENTO</label>
          <select
            id="direccionFiscal-departamento"
            name="direccionFiscal.departamento"
            value={direccion.departamento || ''}
            onChange={handleDepartamentoChange}
            className={inputClass('departamento')}
            aria-invalid={!!errors['direccionFiscal.departamento']}
          >
            <option value="">SELECCIONE...</option>
            {Object.keys(peruData).map(depto => (
              <option key={depto} value={depto}>{formatNombre(depto)}</option>
            ))}
          </select>
          {errors['direccionFiscal.departamento'] && (
            <p className="text-accent-copper-600 text-xs mt-1">{errors['direccionFiscal.departamento']}</p>
          )}
        </div>

        {/* Provincia */}
        <div>
          <label htmlFor="direccionFiscal-provincia" className="block text-sm font-bold text-accent-steel-600 mb-1">PROVINCIA</label>
          <select
            id="direccionFiscal-provincia"
            name="direccionFiscal.provincia"
            value={direccion.provincia || ''}
            onChange={handleProvinciaChange}
            disabled={!direccion.departamento}
            className={inputClass('provincia')}
            aria-invalid={!!errors['direccionFiscal.provincia']}
          >
            <option value="">SELECCIONE...</option>
            {direccion.departamento &&
              Object.keys(peruData[direccion.departamento] || {}).map(prov => (
                <option key={prov} value={prov}>{formatNombre(prov)}</option>
              ))}
          </select>
          {errors['direccionFiscal.provincia'] && (
            <p className="text-accent-copper-600 text-xs mt-1">{errors['direccionFiscal.provincia']}</p>
          )}
        </div>

        {/* Distrito */}
        <div>
          <label htmlFor="direccionFiscal-distrito" className="block text-sm font-bold text-accent-steel-600 mb-1">DISTRITO</label>
          <select
            id="direccionFiscal-distrito"
            name="direccionFiscal.distrito"
            value={direccion.distrito || ''}
            onChange={e => onChange(e.target.name, e.target.value)}
            disabled={!direccion.provincia}
            className={inputClass('distrito')}
            aria-invalid={!!errors['direccionFiscal.distrito']}
          >
            <option value="">SELECCIONE...</option>
            {direccion.departamento &&
              direccion.provincia &&
              (peruData[direccion.departamento]?.[direccion.provincia] || []).map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
          </select>
          {errors['direccionFiscal.distrito'] && (
            <p className="text-accent-copper-600 text-xs mt-1">{errors['direccionFiscal.distrito']}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DireccionFiscal;