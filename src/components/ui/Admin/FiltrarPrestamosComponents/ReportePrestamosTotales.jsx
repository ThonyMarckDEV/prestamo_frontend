import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import FetchWithGif from '../../../Reutilizables/FetchWithGif';
import logo from '../../../../img/logo/Logo_FICSULLANA.png';
import { toast } from 'react-toastify';

const ReportePrestamosTotales = ({ loans, selectedClient, clients, onComplete, onPDFGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDate = (dateString) => {
    try {
      if (!dateString || typeof dateString !== 'string') return '-';
      const parsedDate = parseISO(dateString);
      if (isNaN(parsedDate)) return '-';
      return format(parsedDate, 'dd/MM/yyyy');
    } catch {
      return '-';
    }
  };

  const today = new Date();
  const fechaHoy = format(today, 'dd/MM/yyyy');

  const generateElegantPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = margin;

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

      const checkPageSpace = (requiredSpace) => {
        if (y + requiredSpace > pageHeight - 50) {
          doc.addPage();
          y = 20;
        }
      };

      const drawSection = (title, height = 6) => {
        checkPageSpace(height + 5);
        doc.setFillColor(230, 0, 0);
        doc.rect(margin, y, pageWidth - 2 * margin, height, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(255, 255, 255);
        doc.text(title, margin + 5, y + 4.5);
        y += height + 1;
      };

      const drawInfoBox = (items, boxHeight = 35) => {
        checkPageSpace(boxHeight + 5);
        y += 8;
        items.forEach((item, index) => {
          if (index > 0 && index % 2 === 0) y += 5;
          const xPos = index % 2 === 0 ? margin + 6 : margin + (pageWidth - 2 * margin) / 2 + 6;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(108, 122, 137);
          doc.text(item.label + ':', xPos, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(13);
          doc.setTextColor(44, 62, 80);
          const maxWidth = (pageWidth - 2 * margin) / 2 - 18;
          // Divide el texto en líneas que quepan en el ancho
          const wrappedText = doc.splitTextToSize(item.value || '-', maxWidth);
          // Dibuja todas las líneas, una debajo de otra
          wrappedText.forEach((line, i) => {
            doc.text(line, xPos, y + 5 + i * 5);
          });
          // Ajusta y para la próxima fila según cuántas líneas ocupó el campo actual
          const linesHeight = wrappedText.length * 5;
          if (index % 2 === 1) y += Math.max(linesHeight, 6);
        });
        // Si hay un elemento impar, sube el y para la próxima sección
        if (items.length % 2 === 1) {
          const lastItem = items[items.length - 1];
          const maxWidth = (pageWidth - 2 * margin) / 2 - 18;
          const wrappedText = doc.splitTextToSize(lastItem.value || '-', maxWidth);
          const linesHeight = wrappedText.length * 5;
          y += Math.max(linesHeight, 6);
        }
        y += 6;
      };


      const addLogo = async () => {
        try {
          const logoBase64 = await getBase64FromImage(logo);
          const logoWidth = 67;
          const logoHeight = 64;
          const logoX = margin;
          const headerY = 9;
          doc.addImage(logoBase64, 'PNG', logoX, headerY, logoWidth, logoHeight);
        } catch {
          const logoWidth = 45;
          const logoHeight = 50;
          const logoX = (pageWidth - logoWidth) / 2;
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(230, 0, 0);
          doc.setLineWidth(2);
          doc.roundedRect(logoX, 8, logoWidth, logoHeight, 3, 3, 'FD');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(230, 0, 0);
          doc.text('FICS', logoX + logoWidth / 2, 28, { align: 'center' });
          doc.text('ULLANA', logoX + logoWidth / 2, 38, { align: 'center' });
        }
      };

      doc.setLineWidth(3);
      doc.setDrawColor(230, 0, 0);
      doc.line(0, 0, pageWidth, 0);

      await addLogo();

      const textX = pageWidth - margin;
      const headerY = 38;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80);
      doc.text('REPORTE DE PRÉSTAMOS', textX, headerY + 6, { align: 'right' });
      y += 45;

      drawSection('1. DATOS DEL CLIENTE');
      const selectedClientData = clients.find(client => String(client.idUsuario) === String(selectedClient));
      if (selectedClientData) {
        const direcciones = Array.isArray(selectedClientData.direcciones) && selectedClientData.direcciones.length > 0
          ? selectedClientData.direcciones
          : [{
            tipo: 'N/A',
            tipoVia: '-',
            nombreVia: '-',
            numeroMz: '-',
            urbanizacion: '-',
            distrito: '-',
            provincia: '-',
            departamento: '-'
          }];

        const actividadesEconomicas = Array.isArray(selectedClientData.actividadesEconomicas) && selectedClientData.actividadesEconomicas.length > 0
          ? selectedClientData.actividadesEconomicas
          : [{
            noSensible: { actividad: 'No registrado' }
          }];

        const nombreCompleto = `${selectedClientData.nombre || ''} ${selectedClientData.apellidoPaterno || ''} ${selectedClientData.apellidoMaterno || ''} ${selectedClientData.apellidoConyuge || ''}`.trim();
        const dni = selectedClientData.dni || '-';

        const formatDireccion = (dir) => {
          if (!dir || Object.keys(dir).length === 0) return 'No registrada';
          const partes = [];
          if (dir.tipoVia) partes.push(dir.tipoVia);
          if (dir.nombreVia) partes.push(dir.nombreVia);
          if (dir.numeroMz) partes.push(dir.numeroMz);
          const ubicacion = [dir.urbanizacion, dir.distrito, dir.provincia, dir.departamento]
            .filter(Boolean)
            .map(val => val.replace(/_/g, ' '))
            .join(', ');
          let resultado = partes.join(' ');
          if (ubicacion) resultado += (resultado ? ', ' : '') + ubicacion;
          return resultado.trim() || 'No registrada';
        };

        const direccionFiscal = direcciones.find(dir => dir.tipo?.toLowerCase() === 'fiscal');
        const direccionCorrespondencia = direcciones.find(dir => dir.tipo?.toLowerCase() === 'correspondencia');
        const clientInfo = [
          { label: 'ID CLIENTE', value: selectedClientData.idUsuario },
          direccionFiscal && {
            label: 'DIRECCIÓN FISCAL',
            value: formatDireccion(direccionFiscal)
          },
          { label: 'NOMBRE Y APELLIDOS', value: nombreCompleto },
          direccionCorrespondencia && {
            label: 'DIRECCIÓN DE CORRESPONDENCIA',
            value: formatDireccion(direccionCorrespondencia)
          },
          { label: 'DNI', value: dni },
          ...actividadesEconomicas.map((act, i) => ({
            label: `ACTIVIDAD ECONÓMICA${actividadesEconomicas.length > 1 ? ` ${i + 1}` : ''}`,
            value: act.noSensible?.actividad || act.no_sensible?.actividad || 'No registrado'
          })),

        ];

        drawInfoBox(clientInfo, 24);
      }

      drawSection('2. DETALLES DE PRÉSTAMOS');
      const headers = [
        'ID',
        'Fecha de Inicio',
        'Producto',
        'Monto',
        'Total',
        'Valor Cuota',
        'Cuotas',
        'Frecuencia',
        'Estado',
        'Asesor'
      ];

      const data = loans.map(loan => [
        loan.idPrestamo?.toString() || '-',
        formatDate(loan.fecha_inicio),
        loan.producto || '-',
        loan.monto ? `S/ ${parseFloat(loan.monto).toFixed(2)}` : '-',
        loan.total ? `S/ ${parseFloat(loan.total).toFixed(2)}` : '-',
        loan.valor_cuota ? `S/ ${parseFloat(loan.valor_cuota).toFixed(2)}` : '-',
        loan.cuotas_string || (
          loan.cuotas_pagadas !== undefined && loan.total_cuotas !== undefined
            ? `${loan.cuotas_pagadas} de ${loan.total_cuotas}`
            : loan.cuotas?.toString() || '-'),
        loan.frecuencia.toUpperCase() || '-',
        loan.estado.toUpperCase() || '-',
        loan.asesor || '-']);

      autoTable(doc, {
        head: [headers],
        body: data,
        startY: y,
        margin: { left: margin, right: margin },
        tableWidth: 'auto',
        theme: 'striped',
        headStyles: {
          fillColor: [230, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center',
          valign: 'middle'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          valign: 'middle',
          overflow: 'linebreak'
        },
        bodyStyles: {
          textColor: [44, 62, 80],
          halign: 'center'
        }
      });

      y = doc.lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Fecha de emisión: ${fechaHoy}`, pageWidth / 2, y + 3, { align: 'center' });
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      if (onPDFGenerated) {
        onPDFGenerated(pdfUrl);
      }
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
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

export default ReportePrestamosTotales;
