import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import { toast } from 'react-toastify';
import DatosUsuario from '../PrincipalComponents/FormComponents/DatosUsuario';
import DireccionFiscal from '../PrincipalComponents/FormComponents/DireccionFiscal';
import DireccionCorrespondencia from '../PrincipalComponents/FormComponents/DireccionCorrespondencia';
import ContactoForm from '../PrincipalComponents/FormComponents/ContactoForm';
import InfoFinanciera from '../PrincipalComponents/FormComponents/InfoFinanciera';
import DatosAcceso from '../PrincipalComponents/FormComponents/DatosAcceso';
import peruData from '../../../../utilities/PeruData';
import { transformInitialData, validateFields, flattenErrors } from '../../../../utilities/ValidacionesEmpleado';
import debounce from 'lodash/debounce';

const initialState = {
  idUsuario: '',
  username: '',
  password: '',
  password_confirmation: '',
  idRol: '',
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
    { tipo: 'FISCAL', tipoVia: '', nombreVia: '', numeroMz: '', urbanizacion: '', departamento: '', provincia: '', distrito: '' },
    { tipo: 'CORRESPONDENCIA', tipoVia: '', nombreVia: '', numeroMz: '', urbanizacion: '', departamento: '', provincia: '', distrito: '' }
  ],
  contactos: [{ tipo: 'PRINCIPAL', telefono: '', email: '' }],
  financiera: { numeroCuenta: '', cci: '', entidadFinanciera: '' }
};

const cx = (...classes) => classes.filter(Boolean).join(' ');

const FormAsesores = ({ onAsesorAdded, onAsesorUpdated, initialData, isEditing, onCancel }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  const handleEnablePasswordEdit = () => setEditPassword(true);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setEditPassword(false);
  }, []);

  useEffect(() => {
    if (isEditing && initialData) {
      console.log("Initial data que recibe el formulario:", initialData);
      const transformed = transformInitialData(initialData);
      setFormData(transformed);
      console.log('FormData seteado:', transformed);
      if (!transformed.idUsuario && isEditing) {
        console.error('Error: idUsuario no está definido en modo edición');
        setErrors({ general: 'ID de usuario no disponible para edición' });
      }
    } else if (!isEditing) {
      resetForm();
    }
  }, [isEditing, initialData, resetForm]);

  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isEditing]);

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce((data, editing, passwordEdit) => {
      const newErrors = validateFields(data, editing, passwordEdit);
      setErrors(newErrors);
    }, 300),
    []
  );

  const handleChange = useCallback((name, value) => {
    console.log(`handleChange called - name: ${name}, value: ${value}`);
    setFormData(prevFormData => {
      let newFormData = { ...prevFormData };

      if (name.includes('.')) {
        const [section, field] = name.split('.');

        if (section === 'datos') {
          newFormData = {
            ...prevFormData,
            datos: { ...prevFormData.datos, [field]: value },
          };
        } else if (section.startsWith('direccion')) {
          const tipo = section === 'direccionFiscal' ? 'FISCAL' : 'CORRESPONDENCIA';
          newFormData = {
            ...prevFormData,
            direcciones: prevFormData.direcciones.map((dir) => {
              if (dir.tipo === tipo) {
                let updatedDir = { ...dir, [field]: value };
                if (field === 'departamento') {
                  updatedDir.provincia = '';
                  updatedDir.distrito = '';
                } else if (field === 'provincia') {
                  updatedDir.distrito = '';
                }
                return updatedDir;
              }
              return dir;
            }),
          };
        } else if (section === 'contacto') {
          newFormData = {
            ...prevFormData,
            contactos: prevFormData.contactos.map((cont) =>
              cont.tipo === 'PRINCIPAL' ? { ...cont, [field]: value } : cont
            ),
          };
        } else if (section === 'financiera') {
          newFormData = {
            ...prevFormData,
            financiera: { ...prevFormData.financiera, [field]: value },
          };
        }
      } else {
        newFormData = { ...prevFormData, [name]: value };
      }

      // Trigger debounced validation
      debouncedValidate(newFormData, isEditing, editPassword);
      return newFormData;
    });
  }, [isEditing, editPassword, debouncedValidate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    console.log('handleSubmit ejecutado');
    setIsLoading(true);
    setErrors({});

    try {
      const validationErrors = validateFields(formData, isEditing, editPassword);
      if (Object.keys(validationErrors).length > 0) {
        console.log('Errores de validación:', validationErrors);
        setErrors(validationErrors);
        toast.error('Por favor corrige los errores en el formulario', { autoClose: 5000 });
        setIsLoading(false);
        return;
      }

      if (isEditing && !formData.idUsuario) {
        console.error('Error: idUsuario no está definido para la solicitud PUT');
        setErrors({ general: 'ID de usuario no disponible para actualización' });
        toast.error('ID de usuario no disponible', { autoClose: 5000 });
        setIsLoading(false);
        return;
      }

      const url = isEditing
        ? `${API_BASE_URL}/api/admin/asesores/${formData.idUsuario}`
        : `${API_BASE_URL}/api/admin/asesores`;
      const method = isEditing ? 'PUT' : 'POST';

      console.log('URL que se usará:', url);
      console.log('Datos a enviar:', {
        username: formData.username,
        idRol: formData.idRol,
        ...((!isEditing || editPassword) && {
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
        datos: formData.datos,
        direcciones: formData.direcciones,
        contactos: formData.contactos,
        financiera: formData.financiera,
      });

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          idRol: formData.idRol,
          ...((!isEditing || editPassword) && {
            password: formData.password,
            password_confirmation: formData.password_confirmation,
          }),
          datos: formData.datos,
          direcciones: formData.direcciones,
          contactos: formData.contactos,
          financiera: formData.financiera,
        }),
      });

      console.log('Respuesta de la API:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });

      let data;
      if (response.headers.get('content-type')?.includes('application/json')) {
        data = await response.json();
      } else {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText.slice(0, 100));
        throw new Error(`Respuesta no es JSON: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        if (data.errors) {
          const flattenedErrors = flattenErrors(data.errors);
          setErrors(data.errors);

          flattenedErrors.forEach((error) => {
            toast.error(error, { autoClose: 5000 });
          });

          if (flattenedErrors.length === 0) {
            toast.error(data.message || 'Error en la validación de los datos', { autoClose: 5000 });
          }
        } else {
          const errorMessage = data.message || `Error ${response.status}: ${response.statusText}`;
          setErrors({ general: errorMessage });
          toast.error(errorMessage, { autoClose: 5000 });
        }
        return;
      }

      toast.success(isEditing ? 'Asesor actualizado correctamente' : 'Asesor agregado correctamente', { autoClose: 3000 });
      if (isEditing && typeof onAsesorUpdated === 'function') {
        onAsesorUpdated(data.asesor);
      }
      if (!isEditing && typeof onAsesorAdded === 'function') {
        onAsesorAdded(data.asesor);
      }
      if (onCancel) {
        onCancel();
      } else if (!isEditing) {
        resetForm();
      }
    } catch (error) {
      console.error('Error en submit:', error);
      const errorMessage = error.message || 'Error de conexión con el servidor';
      setErrors({ general: errorMessage });
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  }, [formData, isEditing, editPassword, onAsesorAdded, onAsesorUpdated, onCancel, resetForm]);

  return (
    <form onSubmit={handleSubmit} className="text-gray-800 w-full" aria-busy={isLoading}>
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {errors.general}
        </div>
      )}

      <fieldset disabled={isLoading} className="space-y-6">
        <DatosAcceso
          values={formData}
          errors={errors}
          onChange={handleChange}
          isEditing={isEditing}
          editPassword={editPassword}
          onEnablePasswordEdit={handleEnablePasswordEdit}
        />
        <DatosUsuario
          datos={formData.datos}
          errors={errors}
          onChange={handleChange}
        />
        <DireccionFiscal
          direccion={formData.direcciones.find((d) => d.tipo === 'FISCAL') || formData.direcciones[0]}
          peruData={peruData}
          errors={errors}
          onChange={handleChange}
        />
        <DireccionCorrespondencia
          direccion={formData.direcciones.find((d) => d.tipo === 'CORRESPONDENCIA') || formData.direcciones[1]}
          peruData={peruData}
          errors={errors}
          onChange={handleChange}
        />
        <ContactoForm
          contacto={formData.contactos.find((c) => c.tipo === 'PRINCIPAL') || formData.contactos[0]}
          errors={errors}
          onChange={handleChange}
        />
        <InfoFinanciera
          cuenta={formData.financiera}
          errors={errors}
          onChange={handleChange}
        />
      </fieldset>

      <div className="flex justify-end mt-6 space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CANCELAR
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={cx(
            'text-white font-bold py-2 px-8 rounded focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',
            isEditing
              ? 'bg-accent-yellow-400 hover:bg-accent-yellow-600 focus:ring-accent-yellow-400'
              : 'bg-accent-yellow-400 hover:bg-accent-yellow-600 focus:ring-accent-yellow-400'
          )}
        >
          {isLoading
            ? (isEditing ? 'ACTUALIZANDO...' : 'GUARDANDO...')
            : (isEditing ? 'ACTUALIZAR ASESOR' : 'GUARDAR ASESOR')
          }
        </button>
      </div>
    </form>
  );
};

export default FormAsesores;