import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import FetchWithGif from '../../../Reutilizables/FetchWithGif';
import logo from '../../../../img/logo/Logo_FICSULLANA.png';
import { toast } from 'react-toastify';

const ReporteFiltroCuotas = ({
  cuotas,
  selectedAsesor,
  asesores,
  startDate,
  endDate,
  estado,
  dni,
  selectedGroup,
  onComplete,
  onPDFGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '-';
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
  };

  useEffect(() => {
    generateElegantPDF();
    // eslint-disable-next-line
  }, []);

  const generateElegantPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      // Cambio a orientación landscape
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const addPrefixAndLeadingZeros = (id, prefix, totalLength) => {
        // Convertimos el id en string
        const idStr = String(id);
        // Calculamos cuántos ceros necesitamos añadir
        const zerosNeeded = totalLength - (prefix.length + idStr.length);
        // Creamos el id con los ceros a la izquierda y el id
        const paddedId = '0'.repeat(zerosNeeded) + idStr;
        // Concatenamos el prefijo '79' al principio
        return prefix + paddedId;
      };

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = 15;
      const today = new Date();
      const fechaHoy = format(today, 'dd/MM/yyyy');

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
          const logoWidth = 48;
          const logoHeight = 51;
          const logoX = margin;
          const headerY = 9;
          doc.addImage(logoBase64, 'PNG', logoX, headerY, logoWidth, logoHeight);
        } catch {
          // Fallback si no se puede cargar el logo
        }
      };

      const checkPageSpace = (requiredSpace) => {
        if (y + requiredSpace > pageHeight - 50) {
          doc.addPage();
          y = 20;
          return true;
        }
        return false;
      };

      const drawSection = (title, height = 6) => {
        checkPageSpace(height + 5);
        doc.setFillColor(230, 0, 0);
        doc.rect(margin, y, pageWidth - 2 * margin, height, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(title, margin + 5, y + 4.5);
        y += height + 1;
        return y;
      };

      const drawInfoBox = (items, boxHeight = 35) => {
        checkPageSpace(boxHeight + 5);
        y += 6;
        items.forEach((item, index) => {
          if (index > 0 && index % 2 === 0) y += 5;
          const xPos = index % 2 === 0 ? margin + 6 : margin + (pageWidth - 2 * margin) / 2 + 6;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(108, 122, 137);
          doc.text(item.label + ':', xPos, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(44, 62, 80);
          const maxWidth = (pageWidth - 2 * margin) / 2 - 15;
          const wrappedText = doc.splitTextToSize(item.value || '-', maxWidth);
          doc.text(wrappedText[0], xPos, y + 4);
          if (index % 2 === 1) y += 6;
        });
        if (items.length % 2 === 1) y += 6;
        y += 6;
      };

      await addLogo();

      // Header
      const textX = pageWidth - margin;
      const headerY = 27;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text('REPORTE DE CUOTAS', textX, headerY + 6, { align: 'right' });
      doc.setFontSize(10);
      doc.text('[REPORTE DE FILTRADO]', textX, headerY + 12, { align: 'right' });
      y += 33;

      // Información de filtros
      const selectedAsesorData = asesores.find(asesor => asesor.id === parseInt(selectedAsesor));

      drawSection('1. INFORMACIÓN DE FILTROS APLICADOS');

      const filterInfo = [
        { label: 'Periodo', value: `${startDate ? formatDate(startDate) : 'No especificado'} - ${endDate ? formatDate(endDate) : 'No especificado'}` },
        { label: 'Estado', value: estado || 'TODOS LOS ESTADOS' },
        { label: 'Asesor', value: selectedAsesorData ? selectedAsesorData.nombre : 'TODOS LOS ASESORES' },
        { label: 'Grupo', value: selectedGroup || 'TODOS LOS GRUPOS' },
        { label: 'Total de registros', value: cuotas.length.toString() },
        { label: 'DNI', value: dni || 'TODOS' }
      ];

      drawInfoBox(filterInfo, 30);

      // Sección de detalles con autoTable
      drawSection('2. DETALLES DE CUOTAS');

      const headers = [
        'ID',
        'Cliente',
        'N° Cuota',
        'F. Vencimiento',
        'F. Pago',
        'Capital',
        'Interés',
        'Días Mora',
        'Mora',
        'Otros',
        'Total Cuota',
        'Estado',
        'Asesor'
      ];

      const data = cuotas.map(cuota => [
        addPrefixAndLeadingZeros(cuota.idPrestamo, '79', 10),
        cuota.cliente_nombre || '-',
        cuota.numero_cuota?.toString() || '-',
        formatDate(cuota.fecha_vencimiento),
        formatDate(cuota.fechaPago),
        `S/ ${parseFloat(cuota.capital || 0).toFixed(2)}`,
        `S/ ${parseFloat(cuota.interes || 0).toFixed(2)}`,
        cuota.dias_mora?.toString() || '0',
        cuota.mora_reducida > 0
          ? `S/ ${parseFloat(cuota.mora || 0).toFixed(2)} (-${cuota.mora_reducida}%)`
          : `S/ ${parseFloat(cuota.mora || 0).toFixed(2)}`,
        `S/ ${(cuota.otros !== null
          ? parseFloat(cuota.otros)
          : parseFloat(cuota.monto || 0) - parseFloat(cuota.capital || 0) - parseFloat(cuota.interes || 0)
        ).toFixed(2)}`,
        `S/ ${parseFloat(cuota.monto || 0).toFixed(2)}`,
        cuota.estado || '-',
        cuota.asesor_nombre || '-'
      ]);

      // Fila de totales
      const totals = [
        'TOTALES',
        '',
        '',
        `S/ ${cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.capital || 0), 0).toFixed(2)}`,
        `S/ ${cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.interes || 0), 0).toFixed(2)}`,
        cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.dias_mora || 0), 0).toString(),
        `S/ ${cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.mora || 0), 0).toFixed(2)}`,
        `S/ ${cuotas.reduce((sum, cuota) => sum + (cuota.otros !== null ? parseFloat(cuota.otros) : parseFloat(cuota.monto || 0) - parseFloat(cuota.capital || 0) - parseFloat(cuota.interes || 0)), 0).toFixed(2)}`,
        `S/ ${cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.monto || 0), 0).toFixed(2)}`,
        '',
        ''
      ];

      autoTable(doc, {
        head: [headers],
        body: data,
        startY: y,
        theme: 'striped',
        margin: { left: margin, right: margin },
        tableWidth: pageWidth - 2 * margin,
        headStyles: {
          fillColor: [230, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center',
          valign: 'middle',
          lineWidth: 0,
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          valign: 'middle',
          overflow: 'linebreak',
          lineColor: [220, 220, 220],
          lineWidth: 0.3,
          halign: 'center',
        },
        bodyStyles: {
          textColor: [44, 62, 80],
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { halign: 'left' },   // Cliente
          1: { halign: 'center' }, // N° Cuota
          2: { halign: 'center' }, // F. Vencimiento
          3: { halign: 'center' }, // Capital
          4: { halign: 'center' }, // Interés
          5: { halign: 'center' }, // Días Mora
          6: { halign: 'center' }, // Mora
          7: { halign: 'center' }, // Otros
          8: { halign: 'center' }, // Total Cuota
          9: { halign: 'center' }, // Estado
          10: { halign: 'center' } // Asesor
        },
        didDrawCell: function (data) {
          if (data.row.index === 0 && data.section === 'head') {
            const { doc, cell } = data;
            doc.setDrawColor(230, 0, 0);
            doc.setLineWidth(1);
            doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          }
        },
      });

      y = doc.lastAutoTable.finalY + 10;

      const totalsHeaders = ['CONCEPTO', 'MONTO'];
      const totalsData = [
        ['CAPITAL', `S/ ${cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.capital || 0), 0).toFixed(2)}`],
        ['INTERÉS', `S/ ${cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.interes || 0), 0).toFixed(2)}`],
        ['OTROS', `S/ ${cuotas.reduce((sum, cuota) => sum + (cuota.otros !== null ? parseFloat(cuota.otros) : parseFloat(cuota.monto || 0) - parseFloat(cuota.capital || 0) - parseFloat(cuota.interes || 0)), 0).toFixed(2)}`],
        ['TOTAL', `S/ ${cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.monto || 0), 0).toFixed(2)}`]
      ];

      autoTable(doc, {
        head: [totalsHeaders],
        body: totalsData,
        startY: y,
        theme: 'striped',
        margin: { left: 15 }, // Alinea a la izquierda
        tableWidth: 70,       // Más angosto
        headStyles: {
          fillColor: [230, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          valign: 'middle',
        },
        styles: {
          fontSize: 8,
          cellPadding: 1.5,   // Más compacto
          valign: 'middle',
          lineColor: [220, 220, 220],
          lineWidth: 0.3,
        },
        bodyStyles: {
          textColor: [44, 62, 80],
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold' },
          1: { halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: function (data) {
          if (data.row.index === data.table.body.length - 1) {
            data.cell.styles.fillColor = [230, 0, 0];
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 9;
          }
        },
      });

      // Pie de página
      const finalY = pageHeight - 20;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`Fecha de emisión: ${fechaHoy}`, pageWidth / 2, finalY + 3, { align: 'center' });

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      if (onPDFGenerated) {
        onPDFGenerated(pdfUrl);
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      if (onComplete) {
        onComplete();
      }
      toast.error('Error al generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return isGenerating ? <FetchWithGif /> : null;
};

export default ReporteFiltroCuotas;