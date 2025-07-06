import React from 'react';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import { toast } from 'react-toastify';

const ClientesCard = ({ cliente, onStatusChange, onEdit }) => {
  // Obtener datos correctamente de acuerdo a la estructura
  const datos = cliente.datos || {};
  const direcciones = datos.direcciones || [];
  const contactos = datos.contactos || [];
  const cuentasBancarias = datos.cuentas_bancarias || [];
  const actividadesEconomicas = datos.actividades_economicas || [];

  // Obtener dirección fiscal (generalmente la primera con tipo FISCAL)
  const direccionFiscal = direcciones.find(dir => dir.tipo === 'FISCAL') || {};

  // Obtener dirección de correspondencia
  const direccionCorrespondencia = direcciones.find(dir => dir.tipo === 'CORRESPONDENCIA') || {};

  // Obtener contacto principal
  const contactoPrincipal = contactos.find(cont => cont.tipo === 'PRINCIPAL') || {};

  // Obtener primera cuenta bancaria
  const cuentaPrincipal = cuentasBancarias[0] || {};

  // Get economic activities (select first element or fallback)
  const actividadNoSensible = actividadesEconomicas
    .find(act => act.idNoSensible && act.no_sensible)?.no_sensible.actividad || 'No registrado';

  const actividadCIIU = actividadesEconomicas
    .find(act => act.idCiiu && act.ciiu)?.ciiu.descripcion || 'No registrado';

  const toggleEstado = async () => {
    try {
      const newStatus = cliente.estado === 1 ? 0 : 1;

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/clientes/${cliente.idUsuario}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: newStatus === 1 }),
        }
      );

      if (response.ok) {
        if (onStatusChange) {
          onStatusChange(cliente.idUsuario, newStatus);
        }
        toast.success('Estado actualizado correctamente', { autoClose: 5000 });
      } else {
        // Log the full response for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        // Attempt to parse the response body
        let errorMessage = 'Error al cambiar estado del cliente';
        try {
          const errorData = await response.json();
          console.log('Error data:', errorData); // Log the parsed error data
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          // If JSON parsing fails, try to read as text
          const errorText = await response.text();
          console.log('Error text:', errorText);
          // Attempt to extract message from text if it's JSON-like
          const match = errorText.match(/"message":"(.*?)"/);
          if (match && match[1]) {
            errorMessage = match[1];
          }
        }
        toast.error(errorMessage, { autoClose: 5000 });
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      toast.error('Error de conexión al servidor', { autoClose: 5000 });
    }
  };

  const handleEdit = () => {
    const formElement = document.getElementById('cliente-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    setTimeout(() => {
      if (onEdit) {
        onEdit(cliente);
      }
    }, 200);
  };

  const formatearDireccion = (dir) => {
    if (!dir || Object.keys(dir).length === 0) return 'No registrada';

    const partes = [];
    if (dir.tipoVia) partes.push(dir.tipoVia);
    if (dir.nombreVia) partes.push(dir.nombreVia);
    if (dir.numeroMz) partes.push(dir.numeroMz);
    if (dir.urbanizacion) partes.push(dir.urbanizacion);

    const ubicacion = [dir.distrito, dir.provincia, dir.departamento]
      .filter(Boolean)
      .join(', ');

    let resultado = partes.join(' ');
    if (ubicacion) resultado += (resultado ? ', ' : '') + ubicacion;

    return resultado.trim() || 'No registrada';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-yellow-200 hover:shadow-lg transition-shadow duration-300">
      <div className="border-t-4 border-red-600"></div>
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-2">
          <div>
            <h3 className="text-xl font-semibold text-red-800">
              {datos.nombre || ''} {datos.apellidoPaterno || ''}  {datos.apellidoMaterno || ''}
              <span className="text-sm text-gray-500"> ({datos.estadoCivil || 'No registrado'})</span>
            </h3>
          </div>
          <div className="flex items-center self-start sm:self-auto">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${cliente.estado === 1
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}
            >
              {cliente.estado === 1 ? 'Activo' : 'Inactivo'}
            </span>
            <button
              onClick={toggleEstado}
              className="ml-3 text-gray-500 hover:text-gray-700"
              title={cliente.estado === 1 ? 'Desactivar cliente' : 'Activar cliente'}
            >
              {cliente.estado === 1 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 hover:text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 hover:text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-xs">DNI/CARNET:</p>
              <p className="font-medium">{datos.dni || 'No registrado'}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-xs">RUC:</p>
              <p className="font-medium truncate">{datos.ruc || 'No registrado'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-xs">TELÉFONO:</p>
              <p className="font-medium">{contactoPrincipal.telefono || 'No registrado'}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-xs">E-MAIL:</p>
              <p className="font-medium">{contactoPrincipal.email || 'No registrado'}</p>
            </div>
          </div>

          <div className="p-2 bg-gray-50 rounded-md">
            <p className="text-gray-500 text-xs">DIRECCIÓN FISCAL:</p>
            <p className="font-medium truncate">{formatearDireccion(direccionFiscal)}</p>
          </div>

          <div className="p-2 bg-gray-50 rounded-md">
            <p className="text-gray-500 text-xs">DIRECCIÓN DE CORRESPONDENCIA:</p>
            <p className="font-medium truncate">{formatearDireccion(direccionCorrespondencia)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-xs">N° CUENTA:</p>
              <p className="font-medium">{cuentaPrincipal.numeroCuenta || 'No registrado'}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-xs">ENTIDAD FINANCIERA:</p>
              <p className="font-medium">{cuentaPrincipal.entidadFinanciera || 'No registrado'}</p>
            </div>
          </div>

          <div className="p-2 bg-gray-50 rounded-md">
            <p className="text-gray-500 text-xs">CCI:</p>
            <p className="font-medium">{cuentaPrincipal.cci || 'No registrado'}</p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-xs">ACTIVIDAD CIIU:</p>
              <p className="font-medium line-clamp-2">{actividadCIIU}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-xs">ACTIVIDAD ECONÓMICA:</p>
              <p className="font-medium line-clamp-2">{actividadNoSensible}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 px-4 py-3 border-t border-yellow-200 text-sm flex justify-between items-center">
        <span className="text-xs text-gray-500">ID: {cliente.idUsuario}</span>
        <button
          onClick={handleEdit}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-4 rounded transition duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Editar
        </button>
      </div>
    </div>
  );
};

export default ClientesCard;