const DatosAcceso = ({
  values,
  errors,
  onChange,
  isEditing,
  editPassword,
  onEnablePasswordEdit
}) => {
  // Helper para estilos de los inputs
  const inputClass = (fieldKey) =>
    `shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors[fieldKey] ? 'border-red-500' : 'border-yellow-300'
    }`;

  const handleFieldChange = (e) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-2 h-8 bg-red-600 mr-3 rounded" />
        <h3 className="text-lg font-medium text-red-700">DATOS DE ACCESO</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="username" className="block text-sm font-bold mb-1">
            USUARIO / DNI
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={values.username}
            onChange={handleFieldChange}
            placeholder="EJ: juanperez"
            className={inputClass('username')}
          />
          {errors.username && (
            <p className="text-red-600 text-xs mt-1">{errors.username}</p>
          )}
        </div>
        <div>
          <label htmlFor="idRol" className="block text-sm font-bold mb-1">
            ROL
          </label>
          <select
            id="idRol"
            name="idRol"
            value={values.idRol}
            onChange={handleFieldChange}
            className={inputClass('idRol')}
          >
            <option value="">SELECCIONE ROL...</option>
            <option value="1">Administrador</option>
            {/* <option value="2">Cajero</option> */}
            <option value="3">Asesor</option>
            <option value="4">Auditor</option>
          </select>
          {errors.idRol && (
            <p className="text-red-600 text-xs mt-1">{errors.idRol}</p>
          )}
        </div>

        {/* Solo muestra el botón si está editando y aún no ha activado el cambio */}
        {isEditing && !editPassword && (
          <div className="col-span-2">
            <button
              type="button"
              className="mb-3 px-4 py-2 bg-yellow-200 text-yellow-900 rounded hover:bg-yellow-300"
              onClick={onEnablePasswordEdit}
            >
              Cambiar contraseña
            </button>
          </div>
        )}

        {/* Los campos de clave solo se habilitan si NO está editando o si activó el cambio */}
        <div>
          <label htmlFor="password" className="block text-sm font-bold mb-1">
            CONTRASEÑA
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleFieldChange}
            placeholder="EJ: contraseña123@"
            className={inputClass('password')}
            autoComplete="new-password"
            disabled={isEditing && !editPassword}
          />
          {errors.password && (isEditing ? editPassword : true) && (
            <p className="text-red-600 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-bold mb-1">
            CONFIRMAR CONTRASEÑA
          </label>
          <input
            id="password_confirmation"
            type="password"
            name="password_confirmation"
            value={values.password_confirmation}
            onChange={handleFieldChange}
            placeholder="EJ: contraseña123@"
            className={inputClass('password_confirmation')}
            autoComplete="new-password"
            disabled={isEditing && !editPassword}
          />
          {errors.password_confirmation && (
            <p className="text-red-600 text-xs mt-1">{errors.password_confirmation}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatosAcceso;
