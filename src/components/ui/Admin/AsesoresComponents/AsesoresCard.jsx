import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import { toast } from 'react-toastify';

const AsesoresCard = ({ asesor, onStatusChange, onEdit }) => {
  // Obtener el contacto principal
  const contactoPrincipal = asesor.datos?.contactos?.find(c => c.tipo === 'PRINCIPAL') || {};

  // Obtener direcciones
  const direccionFiscal = asesor.datos?.direcciones?.find(d => d.tipo === 'FISCAL') || {};
  const direccionCorrespondencia = asesor.datos?.direcciones?.find(d => d.tipo === 'CORRESPONDENCIA') || {};

  // Obtener primera cuenta bancaria
  const cuentaBancaria = asesor.datos?.cuentas_bancarias?.[0] || {};

  const toggleEstado = async () => {
    try {
      const newStatus = asesor.estado === 1 ? 0 : 1;

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/asesores/${asesor.idUsuario}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: newStatus ? 'activo' : 'inactivo' }),
        }
      );

      if (response.ok) {
        if (onStatusChange) {
          onStatusChange(asesor.idUsuario, newStatus);
        }
        toast.success('Estado actualizado correctamente');
      } else {
        console.error('Error al cambiar estado del asesor');
        toast.error('Error al cambiar estado del asesor');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      toast.error('Error de conexión al servidor');
    }
  };

  const handleEdit = () => {
    const formElement = document.getElementById('asesor-form');
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
        onEdit(asesor);
      }
    }, 200);
  };

  // Formatear dirección 
  const formatDireccion = (direccion) => {
    if (!direccion || Object.keys(direccion).length === 0) return 'No registrada';

    const partes = [];
    if (direccion.tipoVia) partes.push(direccion.tipoVia);
    if (direccion.nombreVia) partes.push(direccion.nombreVia);
    if (direccion.numeroMz) partes.push(direccion.numeroMz);
    if (direccion.urbanizacion) partes.push(direccion.urbanizacion);

    const ubicacion = [direccion.distrito, direccion.provincia, direccion.departamento]
      .filter(Boolean)
      .map(val => val.replace(/_/g, ' '))
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
              {asesor.datos?.nombre || ''} {asesor.datos?.apellidoPaterno || ''} {asesor.datos?.apellidoMaterno || ''} {asesor.datos?.apellidoConyuge || ''}
              <span className="text-sm text-gray-500"> ({asesor.datos.estadoCivil || 'No registrado'})</span>
            </h3>
          </div>
          <div className="flex items-center self-start sm:self-auto">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${asesor.estado === 1
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}
            >
              {asesor.estado === 1 ? 'Activo' : 'Inactivo'}
            </span>
            <button
              onClick={toggleEstado}
              className="ml-3 text-gray-500 hover:text-gray-700"
              title={asesor.estado === 1 ? 'Desactivar asesor' : 'Activar asesor'}
            >
              {asesor.estado === 1 ? (
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
              <p className="font-medium">{asesor.datos?.dni || 'No registrado'}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-xs">TELÉFONO:</p>
              <p className="font-medium">{contactoPrincipal?.telefono || 'No registrado'}</p>
            </div>
          </div>
          <div className="p-2 bg-gray-50 rounded-md">
            <p className="text-gray-500 text-xs">E-MAIL:</p>
            <p className="font-medium truncate">{contactoPrincipal?.email || 'No registrado'}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-md">
            <p className="text-gray-500 text-xs">DIRECCIÓN FISCAL:</p>
            <p className="font-medium truncate">{formatDireccion(direccionFiscal)}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-md">
            <p className="text-gray-500 text-xs">DIRECCIÓN DE CORRESPONDENCIA:</p>
            <p className="font-medium truncate">{formatDireccion(direccionCorrespondencia)}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-md">
            <p className="text-gray-500 text-xs">N° CUENTA:</p>
            <p className="font-medium">{cuentaBancaria.numeroCuenta || 'No registrada'}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-md">
            <p className="text-gray-500 text-xs">CCI:</p>
            <p className="font-medium">{cuentaBancaria.cci || 'No registrada'}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-md">
            <p className="text-gray-500 text-xs">ENTIDAD FINANCIERA:</p>
            <p className="font-medium">{cuentaBancaria.entidadFinanciera || 'No registrada'}</p>
          </div>
        </div>
      </div>

      <div className="bg-red-50 px-4 py-3 border-t border-yellow-200 text-sm flex justify-between items-center">
        <span className="text-xs text-gray-500">ID: {asesor.idUsuario}</span>
        <button
          onClick={handleEdit}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-4 rounded transition duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          EDITAR
        </button>
      </div>
    </div>
  );
};

export default AsesoresCard;