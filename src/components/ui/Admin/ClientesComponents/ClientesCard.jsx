import { useState, useCallback, useRef } from 'react';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import { toast } from 'react-toastify';
import PDFViewer from './ReporteFichaCliente';

const ClientesCard = ({ cliente, onStatusChange, onEdit }) => {
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const pdfGenerationRef = useRef(false);

  const datos = cliente.datos || {};
  const direcciones = datos.direcciones || [];
  const contactos = datos.contactos || [];
  const cuentasBancarias = datos.cuentas_bancarias || [];
  const actividadesEconomicas = datos.actividades_economicas || [];

  const direccionFiscal = direcciones.find(dir => dir.tipo === 'FISCAL') || {};
  const direccionCorrespondencia = direcciones.find(dir => dir.tipo === 'CORRESPONDENCIA') || {};
  const contactoPrincipal = contactos.find(cont => cont.tipo === 'PRINCIPAL') || {};
  const cuentaPrincipal = cuentasBancarias[0] || {};

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
        toast.success('Estado actualizado correctamente');
      } else {
        console.error('Error al cambiar estado del cliente');
        toast.error('Error al cambiar estado del cliente');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  const handleEdit = useCallback(() => {
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
  }, [onEdit, cliente]);

  const formatearDireccion = (dir) => {
    if (!dir || Object.keys(dir).length === 0) return 'No registrada';
    const partes = [];
    if (dir.tipoVia) partes.push(dir.tipoVia);
    if (dir.nombreVia) partes.push(dir.nombreVia);
    if (dir.numeroMz) partes.push(dir.numeroMz);
    if (dir.urbanizacion) partes.push(dir.urbanizacion);
    const ubicacion = [dir.distrito, dir.provincia, dir.departamento]
      .filter(Boolean)
      .map(val => val.replace(/_/g, ' '))
      .join(', ');
    let resultado = partes.join(' ');
    if (ubicacion) resultado += (resultado ? ', ' : '') + ubicacion;
    return resultado.trim() || 'No registrada';
  };

  const handleGeneratePDF = useCallback(() => {
    if (isGeneratingPDF || pdfGenerationRef.current) {
      console.log('PDF generation already in progress or completed');
      return;
    }
    
    console.log('Starting PDF generation for client:', cliente.idUsuario);
    pdfGenerationRef.current = true;
    setIsGeneratingPDF(true);
    setShowPDFViewer(true);
  }, [isGeneratingPDF, cliente.idUsuario]);

  const handlePDFGenerated = useCallback((url) => {
    setPdfUrl(url);
    setShowModal(true);
  }, []);

  const handlePDFComplete = useCallback(() => {
    console.log('PDF generation completed for client:', cliente.idUsuario);
    setShowPDFViewer(false);
    setIsGeneratingPDF(false);
    pdfGenerationRef.current = false;
  }, [cliente.idUsuario]);

  const closeModal = () => {
    setShowModal(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const pdfViewerKey = `pdf-${cliente.idUsuario}-${Date.now()}`;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-yellow-200 hover:shadow-lg transition-shadow duration-300">
        <div className="border-t-4 border-red-600"></div>
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-2">
            <div>
              <h3 className="text-xl font-semibold text-red-800">
                {datos.nombre || ''} {datos.apellidoPaterno || ''} {datos.apellidoMaterno || ''} {datos.apellidoConyuge || ''}
              </h3>
            </div>
            <div className="flex items-center self-start sm:self-auto">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  cliente.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
              <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className={`ml-3 text-gray-500 hover:text-gray-700 transition-colors duration-200 ${
                  isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={isGeneratingPDF ? 'Generando PDF...' : 'Ver ficha del cliente'}
              >
                {isGeneratingPDF ? (
                  <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 bg-gray-50 rounded-md">
                <p className="text-gray-500 text-xs">DNI/DOCUMENTO:</p>
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
                <p className="text-gray-500 text-xs">ESTADO CIVIL:</p>
                <p className="font-medium">{datos.estadoCivil || 'No registrado'}</p>
              </div>
            </div>

            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-xs">E-MAIL:</p>
              <p className="font-medium truncate">{contactoPrincipal.email || 'No registrado'}</p>
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

      {showPDFViewer && (
        <PDFViewer 
          key={pdfViewerKey}
          cliente={cliente} 
          onComplete={handlePDFComplete}
          onPDFGenerated={handlePDFGenerated}
        />
      )}

      {showModal && pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Vista previa del PDF</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientesCard;