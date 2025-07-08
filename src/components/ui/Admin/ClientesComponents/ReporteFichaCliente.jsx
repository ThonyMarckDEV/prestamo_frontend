import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import FetchWithGif from '../../../Reutilizables/FetchWithGif';
import logo from '../../../../img/logo/Logo_FICSULLANA.png';
import { toast } from 'react-toastify';
import colors from '../../../../utilities/colors'; // Importar colores desde src/utilities/colors.js

// Función para convertir HEX a RGB para jsPDF
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

const PDFViewer = ({ cliente, onComplete, onPDFGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const generateElegantPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const datos = cliente.datos || {};
      const direcciones = datos.direcciones || [];
      const contactos = datos.contactos || [];
      const cuentasBancarias = datos.cuentas_bancarias || [];
      const actividadesEconomicas = datos.actividades_economicas || [];

      const direccionFiscal = direcciones.find((dir) => dir.tipo === 'FISCAL') || {};
      const direccionCorrespondencia = direcciones.find((dir) => dir.tipo === 'CORRESPONDENCIA') || {};
      const contactoPrincipal = contactos.find((cont) => cont.tipo === 'PRINCIPAL') || {};
      const cuentaPrincipal = cuentasBancarias[0] || {};

      const actividadNoSensible =
        actividadesEconomicas.find((act) => act.idNoSensible && act.no_sensible)?.no_sensible.actividad ||
        'No registrado';
      const actividadCIIU =
        actividadesEconomicas.find((act) => act.idCiiu && act.ciiu)?.ciiu.descripcion || 'No registrado';

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let y = 10;

      const getBase64FromImage = (imageUrl) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          };
          img.onerror = reject;
          img.src = imageUrl;
        });
      };

      const addLogo = async () => {
        try {
          const logoBase64 = await getBase64FromImage(logo);
          const logoWidth = 40;
          const logoHeight = 25;
          const logoX = margin;
          const headerY = 9;
          doc.addImage(logoBase64, 'PNG', logoX, headerY, logoWidth, logoHeight);
        } catch {
          const logoWidth = 40;
          const logoHeight = 25;
          const logoX = margin;
          doc.setFillColor(...hexToRgb(colors.neutral.white));
          doc.setDrawColor(...hexToRgb(colors.primary.light)); // Usar primary.light para el borde
          doc.setLineWidth(2);
          doc.roundedRect(logoX, y, logoWidth, logoHeight, 3, 3, 'FD');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(...hexToRgb(colors.primary.light)); // Usar primary.light para el texto
          doc.text('FICS', logoX + logoWidth / 2, y + 15, { align: 'center' });
          doc.text('ULLANA', logoX + logoWidth / 2, y + 25, { align: 'center' });
        }
      };

      await addLogo();

      const capitalizar = (str) => (typeof str === 'string' ? str.replace(/_/g, ' ') : '-');

      const textX = pageWidth - margin;
      const headerY = 27;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...hexToRgb(colors.primary.light)); // Usar primary.light para el encabezado
      doc.text('FICHA DE CLIENTE', textX, headerY + 6, { align: 'right' });
      doc.setFontSize(10);
      doc.text('[PERSONA NATURAL]', textX, headerY + 12, { align: 'right' });

      y += 33;

      const drawSection = (title, height = 6) => {
        doc.setFillColor(...hexToRgb(colors.primary.light)); // Usar primary.light para el fondo de secciones
        doc.rect(margin, y, pageWidth - 2 * margin, height, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...hexToRgb(colors.neutral.white)); // Mantener blanco para el texto de secciones
        doc.text(title, margin + 5, y + 4.5);
        y += height + 1;
        return y;
      };

      const drawInfoBox = (items) => {
        y += 3;

        for (let i = 0; i < items.length; i += 2) {
          const itemLeft = items[i];
          const itemRight = items[i + 1];
          const valueLeft = Array.isArray(itemLeft.value) ? itemLeft.value : [itemLeft.value || '-'];
          const valueRight = itemRight
            ? (Array.isArray(itemRight.value) ? itemRight.value : [itemRight.value || '-'])
            : [''];

          const numLines = Math.max(valueLeft.length, valueRight.length);

          const xLeft = margin + 3;
          const xRight = margin + (pageWidth - 2 * margin) / 2 + 3;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(...hexToRgb(colors.accent.steel.DEFAULT)); // Mantener steel para etiquetas
          doc.text((itemLeft.label || '-') + ':', xLeft, y);
          if (itemRight) doc.text((itemRight.label || '-') + ':', xRight, y);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(...hexToRgb(colors.primary.light)); // Usar primary.light para valores
          for (let l = 0; l < numLines; l++) {
            if (valueLeft[l]) doc.text(valueLeft[l], xLeft, y + 3.5 + l * 4);
            if (itemRight && valueRight[l]) doc.text(valueRight[l], xRight, y + 3.5 + l * 4);
          }

          y += 3.5 + numLines * 4;
        }
        y += 2;
      };

      drawSection('1. INFORMACIÓN PERSONAL DEL CLIENTE');
      drawInfoBox([
        { label: 'Documento de Identidad', value: datos.dni },
        { label: 'RUC', value: datos.ruc },
        { label: 'Nombre y Apellidos', value: `${datos.nombre || ''} ${datos.apellidoPaterno || ''} ${datos.apellidoMaterno || ''}`.trim() },
        { label: 'Estado Civil', value: datos.estadoCivil },
        { label: 'Expuesto Políticamente', value: datos.expuesta ? 'Sí' : 'No' },
        { label: 'Fecha de Caducidad DNI', value: datos.fechaCaducidadDni },
      ]);

      drawSection('2. DIRECCIÓN FISCAL');
      drawInfoBox([
        { label: 'Tipo de Vía', value: direccionFiscal.tipoVia },
        { label: 'Nombre de Vía', value: direccionFiscal.nombreVia },
        { label: 'Número/Mz/Lote', value: direccionFiscal.numeroMz },
        { label: 'Urbanización/Caserío', value: direccionFiscal.urbanizacion },
        { label: 'Distrito', value: capitalizar(direccionFiscal.distrito) },
        { label: 'Provincia', value: capitalizar(direccionFiscal.provincia) },
        { label: 'Departamento', value: capitalizar(direccionFiscal.departamento) },
      ]);

      drawSection('3. DIRECCIÓN DE CORRESPONDENCIA');
      drawInfoBox([
        { label: 'Tipo de Vía', value: direccionCorrespondencia.tipoVia },
        { label: 'Nombre de Vía', value: direccionCorrespondencia.nombreVia },
        { label: 'Número/Mz/Lote', value: direccionCorrespondencia.numeroMz },
        { label: 'Urbanización/Caserío', value: direccionCorrespondencia.urbanizacion },
        { label: 'Distrito', value: capitalizar(direccionCorrespondencia.distrito) },
        { label: 'Provincia', value: capitalizar(direccionCorrespondencia.provincia) },
        { label: 'Departamento', value: capitalizar(direccionCorrespondencia.departamento) },
      ]);

      drawSection('4. INFORMACIÓN DE CONTACTO');
      drawInfoBox([
        { label: 'Teléfono Principal', value: contactoPrincipal.telefono },
        { label: 'Teléfono Secundario', value: contactoPrincipal.telefonoDos },
        { label: 'E-mail', value: contactoPrincipal.email },
      ]);

      drawSection('5. INFORMACIÓN FINANCIERA');
      drawInfoBox([
        { label: 'Número de Cuenta', value: cuentaPrincipal.numeroCuenta },
        { label: 'CCI', value: cuentaPrincipal.cci },
        { label: 'Entidad Financiera', value: cuentaPrincipal.entidadFinanciera },
      ]);

      drawSection('6. ACTIVIDADES ECONÓMICAS');
      const actividadCiiuLines = doc.splitTextToSize(actividadCIIU, (pageWidth - 2 * margin) / 2 - 6);
      drawInfoBox([
        { label: 'Actividad CIIU', value: actividadCiiuLines },
        { label: 'Actividad No Sensible', value: actividadNoSensible },
      ]);

      y += 0;
      doc.setDrawColor(...hexToRgb(colors.primary.light)); // Usar primary.light para la línea divisoria
      doc.setLineWidth(0.7);
      doc.line(margin, y, pageWidth - margin, y);

      y += 5;
      const firmaWidth = (pageWidth - 4 * margin) / 2;
      doc.setDrawColor(...hexToRgb(colors.primary.light)); // Usar primary.light para los rectángulos de firma
      doc.setLineWidth(0.5);
      doc.rect(margin, y, firmaWidth, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...hexToRgb(colors.accent.steel.DEFAULT)); // Mantener steel para texto de firma
      doc.text('FIRMA DEL CLIENTE', margin + firmaWidth / 2, y + 16, { align: 'center' });

      doc.rect(margin + firmaWidth + margin, y, firmaWidth, 20);
      doc.text('HUELLA DACTILAR', margin + firmaWidth + margin + firmaWidth / 2, y + 16, { align: 'center' });

      y += 25;
      const fechaActual = new Date().toLocaleDateString('es-PE');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...hexToRgb(colors.primary.light)); // Usar primary.light para el pie de página
      doc.text(`Documento generado automáticamente el ${fechaActual}`, pageWidth / 2, y, { align: 'center' });
      y += 3;
      doc.text('FIC SULLANA', pageWidth / 2, y, { align: 'center' });

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      if (onPDFGenerated) onPDFGenerated(pdfUrl);
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error generando PDF:', error);
      if (onComplete) onComplete();
      toast.error('Error al generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateElegantPDF();
  }, []);

  return isGenerating ? <FetchWithGif /> : null;
};

export default PDFViewer;