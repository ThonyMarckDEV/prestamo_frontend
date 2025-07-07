const ContactoForm = ({ contacto, errors, onChange }) => {
  const inputClass = (field) =>
    `shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
      errors[`contactos.0.${field}`] ? 'border-red-500' : 'border-primary-600'
    }`;

  const handleTelChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    onChange(e.target.name, value);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-2 h-8 bg-primary mr-3 rounded" />
        <h3 className="text-lg font-medium text-primary-600">DATOS DE CONTACTO</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teléfono principal */}
        <div>
          <label htmlFor="contacto-telefono" className="block text-sm font-bold mb-1">
            TELÉFONO
          </label>
          <input
            id="contacto-telefono"
            name="contacto.telefono"
            type="text"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={9}
            placeholder="EJ: 987654321"
            value={contacto?.telefono || ''}
            onChange={handleTelChange}
            className={inputClass('telefono')}
          />
          {errors['contactos.0.telefono'] && (
            <p className="text-red-500 text-xs mt-1">{errors['contactos.0.telefono'][0]}</p>
          )}
        </div>
        {/* Teléfono 2 */}
        <div>
          <label htmlFor="contacto-telefonoDos" className="block text-sm font-bold mb-1">
            TELÉFONO 2 (OPCIONAL)
          </label>
          <input
            id="contacto-telefonoDos"
            name="contacto.telefonoDos"
            type="text"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={9}
            placeholder="EJ: 912345678"
            value={contacto?.telefonoDos || ''}
            onChange={handleTelChange}
            className={inputClass('telefonoDos')}
          />
          {errors['contactos.0.telefonoDos'] && (
            <p className="text-red-500 text-xs mt-1">{errors['contactos.0.telefonoDos'][0]}</p>
          )}
        </div>
        {/* Email */}
        <div>
          <label htmlFor="contacto-email" className="block text-sm font-bold mb-1">
            EMAIL
          </label>
          <input
            id="contacto-email"
            name="contacto.email"
            type="email"
            autoComplete="email"
            placeholder="EJ: correo@ficsullana"
            value={contacto?.email || ''}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className={inputClass('email')}
            style={{ textTransform: 'lowercase' }}
          />
          {errors['contactos.0.email'] && (
            <p className="text-red-500 text-xs mt-1">{errors['contactos.0.email'][0]}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactoForm;