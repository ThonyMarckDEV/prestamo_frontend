const fields = [
  { key: 'nombre', label: 'NOMBRE(S)', type: 'text', autoComplete: 'given-name' },
  { key: 'apellidoPaterno', label: 'APELLIDO PATERNO', type: 'text', autoComplete: 'family-name' },
  { key: 'apellidoMaterno', label: 'APELLIDO MATERNO', type: 'text', autoComplete: 'family-name' },
  { key: 'apellidoConyuge', label: 'APELLIDO CÓNYUGE (OPCIONAL)', type: 'text', placeholder: 'Opcional', autoComplete: 'off' },
  {
    key: 'estadoCivil',
    label: 'ESTADO CIVIL',
    type: 'select',
    options: [
      { value: '', label: 'SELECCIONE...' },
      { value: 'SOLTERO/A', label: 'SOLTERO/A' },
      { value: 'CONVIVIENTE', label: 'CONVIVIENTE' },
      { value: 'CASADO/A', label: 'CASADO/A' },
      { value: 'VIUDO/A', label: 'VIUDO/A' },
      { value: 'DIVORCIADO/A', label: 'DIVORCIADO/A' },
    ],
  },
  { key: 'dni', label: 'DNI/CARNET DE EXTRANJERÍA', type: 'text', placeholder: '8-9 DÍGITOS', autoComplete: 'off', inputMode: 'numeric', maxLength: 9 },
  { key: 'fechaCaducidadDni', label: 'CADUCIDAD (DNI/CARNET)', type: 'date', placeholder: '', autoComplete: 'off' },
  { key: 'ruc', label: 'RUC', type: 'text', placeholder: '11 DÍGITOS', autoComplete: 'off', inputMode: 'numeric', maxLength: 11 },
];

const DatosUsuario = ({ datos, errors, onChange }) => {
  const inputClass = (fieldKey) =>
    `shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
      errors[`datos.${fieldKey}`] ? 'border-red-500' : 'border-primary-600'
    }`;

  // Solo mayúsculas para campos de texto excepto DNI, RUC, fecha
  const handleUppercaseChange = (key, e) => {
    let value = e.target.value;
    if (key === 'dni' || key === 'ruc') {
      value = value.replace(/[^\d]/g, '');
    } else if (key !== 'fechaCaducidadDni' && key !== 'estadoCivil') {
      value = value.toUpperCase();
    }
    onChange(e.target.name, value);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-2 h-8 bg-primary mr-3 rounded" />
        <h3 className="text-lg font-medium text-primary-600">DATOS PERSONALES</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {fields.map(({ key, label, type, options, placeholder, autoComplete, inputMode, maxLength }) => (
          <div key={key}>
            <label htmlFor={`datos-${key}`} className="block text-sm font-bold mb-1">
              {label}
            </label>
            {type === 'select' ? (
              <select
                id={`datos-${key}`}
                name={`datos.${key}`}
                value={datos[key] || ''}
                onChange={e => handleUppercaseChange(key, e)}
                className={inputClass(key)}
                autoComplete={autoComplete}
              >
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`datos-${key}`}
                name={`datos.${key}`}
                type={type}
                value={datos[key] || ''}
                placeholder={placeholder}
                autoComplete={autoComplete}
                inputMode={inputMode}
                maxLength={maxLength}
                onChange={e => handleUppercaseChange(key, e)}
                className={inputClass(key)}
                style={type === 'text' ? { textTransform: 'uppercase' } : {}}
              />
            )}
            {errors[`datos.${key}`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`datos.${key}`]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatosUsuario;
