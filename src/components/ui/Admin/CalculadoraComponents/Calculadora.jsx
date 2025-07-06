import React, { useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../../../../js/urlHelper';
import { fetchWithAuth } from '../../../../js/authToken';
import ClienteSearch from './ClienteSearch';
import LoanDetails from './LoanDetails';
import LoanResults from './LoanResults';
import AdditionalFields from './AdditionalFields';
import ConfirmationModal from './ConfirmationModal';
import AdvisorSearch from './AdvisorSearch';
import { toast } from 'react-toastify';
import LoadingScreen from '../../../Reutilizables/FetchWithGif';
import { v4 as uuidv4 } from 'uuid';
import { calculateLoan } from '../../../../utilities/loanCalculator';

export default function Calculadora() {
  const [isGroupLoan, setIsGroupLoan] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [advisor, setAdvisor] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const defaultLoanData = {
    id: uuidv4(),
    cliente: '',
    clienteId: null,
    credito: '',
    frecuencia: '',
    interes: '',
    cuotas: '',
    cuota: '',
    total: '',
    fecha: getCurrentDate(0),
    fechaGeneracion: getCurrentDate(0),
    fechaInicio: getCurrentDate(0),
    modalidad: '',
    correrDia: false,
    advisorData: null,
    idProducto: null,
    abonado_por: 'CUENTA CORRIENTE',
  };

  const [formDataList, setFormDataList] = useState([defaultLoanData]);

  function getCurrentDate(addDays = 0) {
    const options = { timeZone: 'America/Lima' };
    const today = new Date();
    if (addDays > 0) {
      today.setDate(today.getDate() + addDays);
    }
    const year = today.toLocaleString('en-US', { year: 'numeric', ...options });
    const month = String(today.toLocaleString('en-US', { month: 'numeric', ...options })).padStart(2, '0');
    const day = String(today.toLocaleString('en-US', { day: 'numeric', ...options })).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const updateDates = useCallback(() => {
    setFormDataList(prev =>
      prev.map(formData => {
        const currentDate = getCurrentDate(0);
        const startDate = formData.correrDia ? getCurrentDate(1) : currentDate;
        return {
          ...formData,
          fecha: startDate,
          fechaGeneracion: currentDate,
          fechaInicio: startDate,
        };
      })
    );
  }, []);

  useEffect(() => {
    updateDates();
  }, [updateDates, formDataList.map(data => data.correrDia).join('-')]);

  const handleInputChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormDataList(prev => {
      const newList = [...prev];
      const updatedFormData = { ...newList[index], [name]: fieldValue };

      if (['credito', 'interes', 'cuotas'].includes(name)) {
        const { total, cuota } = calculateLoan(
          name === 'credito' ? value : updatedFormData.credito,
          name === 'interes' ? value : updatedFormData.interes,
          name === 'cuotas' ? value : updatedFormData.cuotas
        );
        updatedFormData.total = total;
        updatedFormData.cuota = cuota;
      }

      newList[index] = updatedFormData;
      return newList;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['credito', 'frecuencia', 'interes', 'cuotas', 'fecha', 'modalidad', 'idProducto'];
    const errorMessages = [];

    formDataList.forEach((formData, index) => {
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newErrors[`${field}_${index}`] = 'Este campo es obligatorio';
          errorMessages.push(`${getFieldLabel(field)} (Cliente ${index + 1}): Este campo es obligatorio`);
        }
      });

      if (!formData.clienteId) {
        newErrors[`cliente_${index}`] = 'Debe seleccionar un cliente válido';
        errorMessages.push(`Cliente (Cliente ${index + 1}): Debe seleccionar un cliente válido`);
      }

      if (formData.credito === '' || isNaN(formData.credito) || Number(formData.credito) <= 0) {
        newErrors[`credito_${index}`] = 'Solo números positivos mayores a 0';
        errorMessages.push(`Crédito (Cliente ${index + 1}): Solo números positivos mayores a 0`);
      }
      if (formData.interes === '' || isNaN(formData.interes) || Number(formData.interes) < 13 || Number(formData.interes) > 40) {
        newErrors[`interes_${index}`] = 'Debe ser un número entre 13 y 40';
        errorMessages.push(`Interés (Cliente ${index + 1}): Debe ser un número entre 13 y 40`);
      }
      if (formData.cuotas === '' || isNaN(formData.cuotas) || !Number.isInteger(Number(formData.cuotas)) || Number(formData.cuotas) < 2 || Number(formData.cuotas) > 8) {
        newErrors[`cuotas_${index}`] = 'Debe ser un número entero entre 2 y 8';
        errorMessages.push(`Cuotas (Cliente ${index + 1}): Debe ser un número entero entre 2 y 8`);
      }

      if (!isGroupLoan && !formData.advisorData?.idUsuario) {
        newErrors[`asesor_${index}`] = 'Debe seleccionar un asesor válido';
        errorMessages.push(`Asesor (Cliente ${index + 1}): Debe seleccionar un asesor válido`);
      }
    });

    if (isGroupLoan) {
      if (!groupName.trim()) {
        newErrors.groupName = 'El nombre del grupo es obligatorio';
        errorMessages.push('Nombre del grupo: El nombre del grupo es obligatorio');
      }
      if (!advisor?.idUsuario) {
        newErrors.asesor = 'Debe seleccionar un asesor';
        errorMessages.push('Asesor del grupo: Debe seleccionar un asesor');
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(
        <div>
          <p>Por favor corrige los siguientes errores:</p>
          <ul className="list-disc pl-5">
            {errorMessages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>,
        { autoClose: 5000 }
      );
    }
    return Object.keys(newErrors).length === 0;
  };

  const getFieldLabel = (field) => {
    const labels = {
      credito: 'Crédito',
      frecuencia: 'Frecuencia',
      interes: 'Interés',
      cuotas: 'Cuotas',
      fecha: 'Fecha',
      modalidad: 'Modalidad',
      cliente: 'Cliente',
      asesor: 'Asesor',
      idProducto: 'Producto',
      abonado_por: 'Abonado Por',
    };
    return labels[field] || field;
  };

  const handleConfirm = (action) => {
    if (action === 'guardar') {
      const isValid = validateForm();
      if (!isValid) return;
    }
    setConfirmAction(action);
  };

  const handleConfirmYes = async () => {
    if (confirmAction === 'guardar') {
      setLoading(true);
      try {
        let groupId = null;
        if (isGroupLoan) {
          const groupResponse = await fetchWithAuth(`${API_BASE_URL}/api/admin/grupos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: groupName,
              idAsesor: advisor.idUsuario,
              fecha_creacion: getCurrentDate(0),
            }),
          });
          const groupData = await groupResponse.json();
          if (!groupResponse.ok) {
            throw new Error(groupData.error || 'Error al crear grupo');
          }
          groupId = groupData.idGrupo;
        }

        const prestamosData = formDataList.map(formData => ({
          idCliente: formData.clienteId,
          idGrupo: groupId,
          credito: parseFloat(formData.credito),
          frecuencia: formData.frecuencia,
          interes: parseFloat(formData.interes),
          cuotas: parseInt(formData.cuotas, 10),
          cuota: parseFloat(formData.cuota),
          total: parseFloat(formData.total),
          modalidad: formData.modalidad,
          fecha: formData.fecha,
          fechaInicio: formData.fechaInicio,
          fechaGeneracion: formData.fechaGeneracion,
          idAsesor: advisor ? advisor.idUsuario : formData.advisorData?.idUsuario,
          idProducto: formData.idProducto,
          abonado_por: formData.abonado_por,
        }));

        const endpoint = isGroupLoan ? `${API_BASE_URL}/api/admin/prestamos/grupo` : `${API_BASE_URL}/api/admin/prestamo`;
        const response = await fetchWithAuth(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isGroupLoan ? { prestamos: prestamosData } : prestamosData[0]),
        });

        const responseData = await response.json();
        if (!response.ok) {
          const newErrors = {};
          if (responseData.errors) {
            prestamosData.forEach((_, index) => {
              Object.keys(responseData.errors).forEach(key => {
                const errorMsg = responseData.errors[key][0];
                const fieldMap = {
                  idCliente: `cliente_${index}`,
                  credito: `credito_${index}`,
                  frecuencia: `frecuencia_${index}`,
                  interes: `interes_${index}`,
                  cuotas: `cuotas_${index}`,
                  cuota: `cuota_${index}`,
                  total: `total_${index}`,
                  modalidad: `modalidad_${index}`,
                  fecha: `fecha_${index}`,
                  fechaInicio: `fechaInicio_${index}`,
                  fechaGeneracion: `fechaGeneracion_${index}`,
                  idAsesor: isGroupLoan ? 'asesor' : `asesor_${index}`,
                  idProducto: `idProducto_${index}`,
                  abonado_por: `abonado_por_${index}`,
                };
                if (fieldMap[key]) {
                  newErrors[fieldMap[key]] = errorMsg;
                }
              });
            });
          }

          if (responseData.error && responseData.error.includes('El cliente')) {
            prestamosData.forEach((_, index) => {
              newErrors[`cliente_${index}`] = responseData.error;
            });
          } else if (responseData.error) {
            toast.error(responseData.error);
          }

          setErrors(newErrors);
          if (Object.keys(newErrors).length > 0) {
            toast.error(
              <div>
                <p>Por favor corrige los siguientes errores del servidor:</p>
                <ul className="list-disc pl-5">
                  {Object.entries(newErrors).map(([key, msg], idx) => (
                    <li key={idx}>
                      {getFieldLabel(key.split('_')[0])} {key.includes('_') ? `(Cliente ${parseInt(key.split('_')[1]) + 1})` : ''}: {msg}
                    </li>
                  ))}
                </ul>
              </div>,
              { autoClose: 5000 }
            );
          }
          throw new Error(responseData.error || 'Error al guardar préstamos');
        }

        if (responseData.success) {
          toast.success('Préstamos registrados correctamente');
          handleReset();
        } else {
          toast.error('Error desconocido al procesar la solicitud');
        }
      } catch (error) {
        if (!errors || Object.keys(errors).length === 0) {
          toast.error('Error al guardar: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    } else if (confirmAction === 'cancelar') {
      handleReset();
    }
    setConfirmAction(null);
  };

  const handleReset = () => {
    setGroupName('');
    setIsGroupLoan(false);
    setAdvisor(null);
    setFormDataList([defaultLoanData]);
    setErrors({});
  };

  const handleConfirmNo = () => {
    setConfirmAction(null);
  };

  const addClient = () => {
    setFormDataList(prev => [...prev, { ...defaultLoanData, id: uuidv4() }]);
  };

  const removeClient = (index) => {
    setFormDataList(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full h-full md:min-h-screen overflow-auto pb-16">
      {loading && <LoadingScreen />}
      <div className="bg-white shadow-lg rounded-lg p-3 sm:p-5 md:py-8 mx-auto w-full border-t-4 border-red-600">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-6 text-red-600 text-center">
          REGISTRO DE CRÉDITOS
        </h2>

        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-start bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <input
              type="checkbox"
              id="isGroupLoan"
              checked={isGroupLoan}
              onChange={(e) => {
                setIsGroupLoan(e.target.checked);
                if (!e.target.checked) {
                  setFormDataList([defaultLoanData]);
                  setGroupName('');
                  setAdvisor(null);
                }
              }}
              className="h-5 w-5 text-red-600 focus:ring-2 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm sm:text-base font-semibold text-gray-700">
              CRÉDITO GRUPAL
            </span>
            {isGroupLoan && (
              <>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Nombre del grupo"
                  className={`ml-4 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.groupName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.groupName && (
                  <p className="text-red-500 text-xs mt-1 ml-4">{errors.groupName}</p>
                )}
              </>
            )}
          </div>
        </div>

        {isGroupLoan && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              ASESOR DEL GRUPO:
            </label>
            <AdvisorSearch
              selectedAdvisor={advisor}
              onSelect={setAdvisor}
              onRemove={() => setAdvisor(null)}
              errors={errors.asesor}
            />
            {errors.asesor && (
              <p className="text-red-500 text-xs mt-1">{errors.asesor}</p>
            )}
          </div>
        )}

        {formDataList.map((formData, index) => (
          <div key={formData.id} className="border-b pb-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cliente {index + 1}</h3>
              {isGroupLoan && formDataList.length > 1 && (
                <button
                  onClick={() => removeClient(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ELIMINAR
                </button>
              )}
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-start bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <span className="text-sm sm:text-base font-semibold text-gray-700 mr-3">
                  CORRER DÍA:
                </span>
                <input
                  type="checkbox"
                  id={`correrDia_${index}`}
                  name="correrDia"
                  checked={formData.correrDia}
                  onChange={(e) => handleInputChange(index, e)}
                  className="h-5 w-5 text-red-600 focus:ring-2 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-4 text-sm text-gray-600">
                  {formData.correrDia ? 'Fecha: Mañana' : 'Fecha: Hoy'} ({formData.fecha})
                </span>
              </div>
            </div>
            <ClienteSearch
              cliente={formData.cliente}
              setCliente={(value) => setFormDataList(prev => {
                const newList = [...prev];
                newList[index] = { ...newList[index], cliente: value };
                return newList;
              })}
              setClienteId={(value) => setFormDataList(prev => {
                const newList = [...prev];
                newList[index] = { ...newList[index], clienteId: value };
                return newList;
              })}
              error={errors[`cliente_${index}`]}
              setErrors={setErrors}
              onClear={() => setFormDataList(prev => {
                const newList = [...prev];
                newList[index] = { ...newList[index], cliente: '', clienteId: null };
                return newList;
              })}
            />
            <LoanDetails
              formData={formData}
              handleInputChange={(e) => handleInputChange(index, e)}
              errors={Object.fromEntries(
                Object.entries(errors).filter(([key]) => key.endsWith(`_${index}`))
              )}
            />
            <LoanResults formData={formData} />
            <AdditionalFields
              formData={formData}
              handleInputChange={(e) => handleInputChange(index, e)}
              errors={Object.fromEntries(
                Object.entries(errors).filter(([key]) => key.endsWith(`_${index}`))
              )}
              isGroupLoan={isGroupLoan}
              advisor={advisor}
            />
          </div>
        ))}

        {isGroupLoan && (
          <button
            onClick={addClient}
            className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md text-sm sm:text-base"
          >
            AGREGAR CLIENTE
          </button>
        )}

        <div className="mt-3 md:mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={() => handleConfirm('cancelar')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 md:py-3 px-4 rounded-lg shadow-md text-sm sm:text-base"
          >
            CANCELAR
          </button>
          <button
            onClick={() => handleConfirm('guardar')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 md:py-3 px-4 rounded-lg shadow-md text-sm sm:text-base"
          >
            GUARDAR
          </button>
        </div>
      </div>

      {confirmAction && (
        <ConfirmationModal
          action={confirmAction}
          onConfirm={handleConfirmYes}
          onCancel={handleConfirmNo}
        />
      )}
    </div>
  );
}