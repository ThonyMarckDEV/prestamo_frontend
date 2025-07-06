import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import { toast } from 'react-toastify';
import DatosUsuario from '../PrincipalComponents/FormComponents/DatosUsuario';
import DireccionCorrespondencia from '../PrincipalComponents/FormComponents/DireccionCorrespondencia';
import DireccionFiscal from '../PrincipalComponents/FormComponents/DireccionFiscal';
import ContactoForm from '../PrincipalComponents/FormComponents/ContactoForm';
import InfoFinanciera from '../PrincipalComponents/FormComponents/InfoFinanciera';
import ActividadesForm from './FormComponents/ActividadesForm';
import RadioOptionGroup from './FormComponents/RadioOptionGroup';
import FormSection from './FormComponents/FormSection';
import peruData from '../../../../utilities/PeruData';
import { transformInitialData, validateFields, flattenErrors } from '../../../../utilities/ValidacionesCliente';

const initialState = {
  datos: {
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    apellidoConyuge: '',
    estadoCivil: '',
    dni: '',
    fechaCaducidadDni: '',
    ruc: '',
  },
  direcciones: [
    {
      tipo: 'FISCAL',
      tipoVia: '',
      nombreVia: '',
      numeroMz: '',
      urbanizacion: '',
      departamento: '',
      provincia: '',
      distrito: '',
    },
    {
      tipo: 'CORRESPONDENCIA',
      tipoVia: '',
      nombreVia: '',
      numeroMz: '',
      urbanizacion: '',
      departamento: '',
      provincia: '',
      distrito: '',
    },
  ],
  contactos: [{ tipo: 'PRINCIPAL', telefono: '', telefonoDos: '', email: '' }],
  cuentasBancarias: [{ numeroCuenta: '', cci: '', entidadFinanciera: '' }],
  actividadesEconomicas: {
    noSensibles: null,
    ciiu: null,
  },
  expuesta: 0,
  aval: 0,
};

const FormClientes = ({ onClientAdded, onClientUpdated, initialData, isEditing, onCancel }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
  }, []);

  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && initialData) {
      const transformedData = transformInitialData(initialData);
      console.log('formData inicializado:', transformedData);
      setFormData(transformedData);
    } else if (!isEditing) {
      resetForm();
    }
  }, [isEditing, initialData, resetForm]);

  const handleChange = useCallback((name, value) => {
    console.log(`handleChange called - name: ${name}, value: ${value}`);
    if (name.includes('.')) {
      const [section, field] = name.split('.');

      if (section === 'actividadesEconomicas') {
        setFormData((prev) => ({
          ...prev,
          actividadesEconomicas: {
            ...prev.actividadesEconomicas,
            [field]: value,
          },
        }));
      } else if (section.startsWith('direccion')) {
        const tipo = section === 'direccionFiscal' ? 'FISCAL' : 'CORRESPONDENCIA';
        setFormData((prev) => ({
          ...prev,
          direcciones: prev.direcciones.map((dir) =>
            dir.tipo === tipo ? { ...dir, [field]: value } : dir
          ),
        }));
      } else if (section === 'contacto') {
        setFormData((prev) => ({
          ...prev,
          contactos: prev.contactos.map((cont) =>
            cont.tipo === 'PRINCIPAL' ? { ...cont, [field]: value } : cont
          ),
        }));
      } else if (section === 'financiera') {
        setFormData((prev) => ({
          ...prev,
          cuentasBancarias: prev.cuentasBancarias.map((cuenta, index) =>
            index === 0 ? { ...cuenta, [field]: value } : cuenta
          ),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [section]: { ...prev[section], [field]: value },
        }));
      }
    } else {
      if (name === 'expuesta' || name === 'aval') {
        const booleanValue = (value === 'SÍ' || value === 'SI') ? 1 : 0;
        setFormData((prev) => ({
          ...prev,
          [name]: booleanValue,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }

    // Clear related errors on change
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (name.includes('.')) {
        const [section, field] = name.split('.');
        if (newErrors[`${section}.${field}`]) {
          delete newErrors[`${section}.${field}`];
        }
        // Clear indexed errors for contactos
        if (section === 'contacto') {
          if (newErrors[`contactos.0.${field}`]) {
            delete newErrors[`contactos.0.${field}`];
          }
        }
      } else if (newErrors[name]) {
        delete newErrors[name];
      }
      return newErrors;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      console.log('handleSubmit ejecutado');
      setIsLoading(true);
      setErrors({});

      console.log('formData enviado:', formData);

      const validationErrors = validateFields(formData);
      if (Object.keys(validationErrors).length > 0) {
        console.log('Errores de validación frontend:', validationErrors);
        setErrors(validationErrors);
        toast.error('Por favor corrige los errores en el formulario', { autoClose: 5000 });
        setIsLoading(false);
        return;
      }

      try {
        const url = isEditing
          ? `${API_BASE_URL}/api/admin/clientes/${formData.idUsuario}`
          : `${API_BASE_URL}/api/admin/clientes`;
        const method = isEditing ? 'PUT' : 'POST';

        const dataToSend = {
          dni: formData.datos.dni,
          datos: {
            nombre: formData.datos.nombre,
            apellidoPaterno: formData.datos.apellidoPaterno,
            apellidoMaterno: formData.datos.apellidoMaterno,
            apellidoConyuge: formData.datos.apellidoConyuge || null,
            estadoCivil: formData.datos.estadoCivil,
            fechaCaducidadDni: formData.datos.fechaCaducidadDni,
            dni: formData.datos.dni,
            ruc: formData.datos.ruc || null,
            expuesta: formData.expuesta === 1,
            aval: formData.aval === 1,
          },
          direcciones: formData.direcciones.map((dir) => ({
            tipoVia: dir.tipoVia || null,
            nombreVia: dir.nombreVia || null,
            numeroMz: dir.numeroMz || null,
            urbanizacion: dir.urbanizacion,
            departamento: dir.departamento,
            provincia: dir.provincia,
            distrito: dir.distrito,
            tipo: dir.tipo,
          })),
          contactos: formData.contactos.map((cont) => ({
            tipo: cont.tipo,
            telefono: cont.telefono,
            telefonoDos: cont.telefonoDos || null,
            email: cont.email,
          })),
          cuentasBancarias: formData.cuentasBancarias.map((cuenta) => ({
            numeroCuenta: cuenta.numeroCuenta,
            cci: cuenta.cci || null,
            entidadFinanciera: cuenta.entidadFinanciera,
          })),
          actividadesEconomicas: {
            noSensibles: formData.actividadesEconomicas.noSensibles
              ? [formData.actividadesEconomicas.noSensibles.idNoSensible]
              : [],
            ciiu: formData.actividadesEconomicas.ciiu
              ? [formData.actividadesEconomicas.ciiu.idCiiu]
              : [],
          },
        };

        console.log('Enviando datos:', dataToSend);

        const response = await fetchWithAuth(url, {
          method,
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(dataToSend),
        });

        console.log('Respuesta de la API:', { status: response.status, statusText: response.statusText });

        const data = await response.json();
        console.log('Datos de la API:', data);

        if (!response.ok) {
          if (data.errors) {
            console.log('Errores del backend:', data.errors);
            setErrors(data.errors); // Set nested errors for field-specific display
            const flattenedErrors = flattenErrors(data.errors);
            if (flattenedErrors.length > 0) {
              toast.error(flattenedErrors.join('\n'), {
                autoClose: 7000,
                style: { whiteSpace: 'pre-line' },
              });
            } else {
              toast.error(data.message || 'Error en la validación de los datos', { autoClose: 5000 });
            }
          } else {
            const errorMessage = data.message || `Error ${response.status}: ${response.statusText}`;
            console.log('Error general:', errorMessage);
            setErrors({ general: errorMessage });
            toast.error(errorMessage, { autoClose: 5000 });
          }
          setIsLoading(false);
          return;
        }

        const successMessage = `Cliente ${isEditing ? 'actualizado' : 'agregado'} correctamente`;
        toast.success(successMessage, { autoClose: 3000 });
        if (isEditing && typeof onClientUpdated === 'function') {
          onClientUpdated(data);
        }
        if (!isEditing && typeof onClientAdded === 'function') {
          onClientAdded(data);
        }
        if (onCancel) onCancel();
        else if (!isEditing) resetForm();
      } catch (err) {
        console.error('Error en la solicitud:', err);
        const errorMessage = err.message || 'Error de conexión al servidor';
        setErrors({ general: errorMessage });
        toast.error(errorMessage, { autoClose: 5000 });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, isEditing, onClientAdded, onClientUpdated, onCancel, resetForm]
  );

  const memoizedActividades = useMemo(
    () => formData.actividadesEconomicas,
    [formData.actividadesEconomicas]
  );

  return (
    <form onSubmit={handleSubmit} className="text-gray-800 w-full" aria-busy={isLoading}>
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {errors.general}
        </div>
      )}

      <fieldset disabled={isLoading} className="space-y-6">
        <DatosUsuario datos={formData.datos} errors={errors} onChange={handleChange} />
        <DireccionFiscal
          direccion={formData.direcciones.find((d) => d.tipo === 'FISCAL')}
          peruData={peruData}
          errors={errors}
          onChange={handleChange}
        />
        <DireccionCorrespondencia
          direccion={formData.direcciones.find((d) => d.tipo === 'CORRESPONDENCIA')}
          peruData={peruData}
          errors={errors}
          onChange={handleChange}
        />
        <ContactoForm
          contacto={formData.contactos.find((c) => c.tipo === 'PRINCIPAL')}
          errors={errors}
          onChange={handleChange}
        />
        <InfoFinanciera
          cuenta={formData.cuentasBancarias[0]}
          errors={errors}
          onChange={handleChange}
        />
        <ActividadesForm
          actividades={memoizedActividades}
          errors={errors}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormSection title="PERSONA EXPUESTA POLÍTICAMENTE">
          <RadioOptionGroup
            name="expuesta"
            value={formData.expuesta}
            options={['SÍ', 'NO']}
            onChange={handleChange}
            error={errors.expuesta}
          />
        </FormSection>
        <FormSection title="¿ES AVAL?">
          <RadioOptionGroup
            name="aval"
            value={formData.aval}
            options={['SÍ', 'NO']}
            onChange={handleChange}
            error={errors.aval}
          />
        </FormSection>
      </fieldset>

      <div className="flex justify-end mt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mr-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded"
          >
            CANCELAR
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-bold rounded-lg text-sm px-6 py-2.5 focus:outline-none disabled:opacity-50"
        >
          {isLoading
            ? isEditing
              ? 'ACTUALIZANDO...'
              : 'GUARDANDO...'
            : isEditing
              ? 'ACTUALIZAR CLIENTE'
              : 'GUARDAR CLIENTE'}
        </button>
      </div>
    </form>
  );
};

export default FormClientes;