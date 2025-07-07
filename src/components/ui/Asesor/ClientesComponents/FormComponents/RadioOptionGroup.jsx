const RadioOptionGroup = ({ name, value, options, onChange, error }) => {
  return (
    <>
      <div className="flex items-center space-x-6">
        {options.map(opt => {
          // Convertir el option a valor numérico para la comparación
          const optionValue = (opt === 'SÍ' || opt === 'SI') ? 1 : 0;
          
          return (
            <label key={opt} className="inline-flex items-center">
              <input
                type="radio"
                name={name}
                value={opt}
                checked={value === optionValue}
                onChange={() => onChange(name, opt)}
                className="form-radio"
              />
              <span className="ml-2">{opt}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </>
  );
};

export default RadioOptionGroup;