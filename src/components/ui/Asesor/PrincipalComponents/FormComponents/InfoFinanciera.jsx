const InfoFinanciera = ({ cuenta, errors, onChange }) => {
  const inputClass = (field) =>
    `shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
      errors[`cuentasBancarias.0.${field}`] ? 'border-red-500' : 'border-primary-600'
    }`;

  const selectClass = inputClass;

  const handleNumeroCuentaChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value.length > 20) value = value.slice(0, 20);
    onChange(e.target.name, value);
  };

  const handleCciChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value.length > 20) value = value.slice(0, 20);
    onChange(e.target.name, value);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-2 h-8 bg-primary mr-3 rounded" />
        <h3 className="text-lg font-medium text-primary-600s">INFORMACIÓN FINANCIERA</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Número de Cuenta */}
        <div>
          <label htmlFor="financiera-numeroCuenta" className="block text-sm font-bold mb-1">
            NÚMERO DE CUENTA
          </label>
          <input
            id="financiera-numeroCuenta"
            name="financiera.numeroCuenta"
            value={cuenta?.numeroCuenta || ''}
            onChange={handleNumeroCuentaChange}
            className={inputClass('numeroCuenta')}
            inputMode="numeric"
            placeholder="10 A 20 DÍGITOS"
            autoComplete="off"
          />
          {errors['cuentasBancarias.0.numeroCuenta'] && (
            <p className="text-red-500 text-xs mt-1">{errors['cuentasBancarias.0.numeroCuenta'][0]}</p>
          )}
        </div>
        {/* CCI */}
        <div>
          <label htmlFor="financiera-cci" className="block text-sm font-bold mb-1">
            CCI
          </label>
          <input
            id="financiera-cci"
            name="financiera.cci"
            value={cuenta?.cci || ''}
            onChange={handleCciChange}
            className={inputClass('cci')}
            inputMode="numeric"
            placeholder="20 DÍGITOS"
            autoComplete="off"
          />
          {errors['cuentasBancarias.0.cci'] && (
            <p className="text-red-500 text-xs mt-1">{errors['cuentasBancarias.0.cci'][0]}</p>
          )}
        </div>
        {/* Entidad Financiera */}
        <div>
          <label htmlFor="financiera-entidadFinanciera" className="block text-sm font-bold mb-1">
            ENTIDAD FINANCIERA
          </label>
          <select
            id="financiera-entidadFinanciera"
            name="financiera.entidadFinanciera"
            value={cuenta?.entidadFinanciera || ''}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className={selectClass('entidadFinanciera')}
          >
            <option value="">SELECCIONE...</option>
            <option value="BCP">BCP</option>
            <option value="INTERBANK">INTERBANK</option>
            <option value="SCOTIABANK">SCOTIABANK</option>
            <option value="BBVA">BBVA</option>
            <option value="BANCO DE LA NACION">BANCO DE LA NACIÓN</option>
            <option value="BANCO PICHINCHA">BANCO PICHINCHA</option>
            <option value="MIBANCO">MIBANCO</option>
            <option value="BANBIF">BANBIF</option>
            <option value="FALABELLA">FALABELLA</option>
            <option value="CAJA PIURA">CAJA PIURA</option>
            <option value="CAJA AREQUIPA">CAJA AREQUIPA</option>
            <option value="CAJA HUANCAYO">CAJA HUANCAYO</option>
            <option value="CAJA TRUJILLO">CAJA TRUJILLO</option>
            <option value="CAJA CUSCO">CAJA CUSCO</option>
          </select>
          {errors['cuentasBancarias.0.entidadFinanciera'] && (
            <p className="text-red-500 text-xs mt-1">{errors['cuentasBancarias.0.entidadFinanciera'][0]}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoFinanciera;