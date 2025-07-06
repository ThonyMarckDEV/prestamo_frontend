import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import FetchWithGif from '../../../../components/Reutilizables/FetchWithGif';
import logo from '../../../../img/logo/Logo_FICSULLANA.png';
import { toast } from 'react-toastify';

const InstallmentReportViewer = ({ cuotas, selectedClient, selectedLoan, clients, loans, asesores, selectedAsesor, onComplete, onPDFGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '-';
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
  };

  const generateElegantPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = 15;

      const addLogo = async () => {
        try {
          const logoBase64 = await getBase64FromImage(logo);
          const logoWidth = 45;
          const logoHeight = 50;
          const logoX = (pageWidth - logoWidth) / 2;
          doc.addImage(logoBase64, 'PNG', logoX, 8, logoWidth, logoHeight);
        } catch (error) {
          console.warn('No se pudo cargar el logo, usando texto alternativo');
          const logoWidth = 45;
          const logoHeight = 50;
          const logoX = (pageWidth - logoWidth) / 2;
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(230, 0, 0);
          doc.setLineWidth(2);
          doc.roundedRect(logoX, 8, logoWidth, logoHeight, 3, 3, 'FD');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(230, 0, 0);
          doc.text('FICS', logoX + logoWidth / 2, 28, { align: 'center' });
          doc.text('ULLANA', logoX + logoWidth / 2, 38, { align: 'center' });
        }
      };

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
          doc.setFontSize(8);
          doc.setTextColor(108, 122, 137);
          doc.text(item.label + ':', xPos, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(44, 62, 80);
          const maxWidth = (pageWidth - 2 * margin) / 2 - 15;
          const wrappedText = doc.splitTextToSize(item.value || '-', maxWidth);
          doc.text(wrappedText[0], xPos, y + 3);
          if (index % 2 === 1) y += 6;
        });
        if (items.length % 2 === 1) y += 6;
        y += 6;
      };

      doc.setFillColor(240, 248, 255);
      doc.rect(0, 0, pageWidth, 70, 'F');
      doc.setLineWidth(3);
      doc.setDrawColor(230, 0, 0);
      doc.line(0, 0, pageWidth, 0);

      await addLogo();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80);
      doc.text('REPORTE DE CUOTAS', pageWidth / 2, 55, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(108, 122, 137);
      const fechaActual = new Date().toLocaleDateString('es-PE');
      doc.text(`Generado el ${fechaActual}`, pageWidth / 2, 60, { align: 'center' });

      y = 78;

      const selectedClientData = clients.find(client => client.idUsuario === selectedClient);
      const selectedLoanData = loans.find(loan => loan.idPrestamo === selectedLoan);

      if (selectedClientData && selectedLoanData) {
        drawSection('1. INFORMACIÓN DEL CLIENTE Y PRÉSTAMO');
        const clientLoanInfo = [
          { label: 'Nombre Completo', value: `${selectedClientData.nombre} ${selectedClientData.apellidoPaterno} ${selectedClientData.apellidoMaterno}` },
          { label: 'DNI', value: selectedClientData.dni },
          { label: 'ID Préstamo', value: selectedLoanData.idPrestamo.toString() },
          { label: 'Monto', value: `S/ ${parseFloat(selectedLoanData.monto).toFixed(2)}` },
          { label: 'Total', value: `S/ ${parseFloat(selectedLoanData.total).toFixed(2)}` },
          { label: 'Cuotas', value: selectedLoanData.cuotas.toString() },
          { label: 'Valor Cuota', value: `S/ ${parseFloat(selectedLoanData.valor_cuota).toFixed(2)}` },
          { label: 'Frecuencia', value: selectedLoanData.frecuencia },
          { label: 'Fecha Inicio', value: formatDate(selectedLoanData.fecha_inicio) },
          { label: 'Asesor', value: selectedLoanData.asesor || '-' } // Updated to use selectedLoanData.asesor
        ];
        drawInfoBox(clientLoanInfo, 40);
      }

      drawSection('2. DETALLES DE CUOTAS');

      const headers = [
        'N° Cuota',
        'Vencimiento',
        'Capital',
        'Interés',
        'Días Mora',
        'Mora',
        'Otros',
        'Cuota',
        'Estado',
        'Observaciones'
      ];

      const data = cuotas.map(cuota => [
        cuota.numero_cuota.toString(),
        formatDate(cuota.fecha_vencimiento),
        `S/ ${parseFloat(cuota.capital).toFixed(2)}`,
        `S/ ${parseFloat(cuota.interes).toFixed(2)}`,
        cuota.dias_mora.toString(),
        cuota.mora_reducida > 0
          ? `S/ ${parseFloat(cuota.mora || 0).toFixed(2)} (-${cuota.mora_reducida}%)`
          : `S/ ${parseFloat(cuota.mora || 0).toFixed(2)}`,
        `S/ ${parseFloat(cuota.otros).toFixed(2)}`,
        `S/ ${parseFloat(cuota.monto).toFixed(2)}`,
        cuota.estado,
        cuota.observaciones || '-'
      ]);

      const totals = [
        'TOTALES',
        '',
        `S/ ${cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.capital), 0).toFixed(2)}`,
        `S/ ${cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.interes), 0).toFixed(2)}`,
        cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.dias_mora || 0), 0).toString(),
        '',
        `S/ ${cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.otros), 0).toFixed(2)}`,
        `S/ ${cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.monto), 0).toFixed(2)}`,
        '',
        '',
        ''
      ];

      autoTable(doc, {
        head: [headers],
        body: [...data, totals],
        startY: y,
        theme: 'striped',
        headStyles: { fillColor: [230, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 21 },
          2: { cellWidth: 19 },
          3: { cellWidth: 19 },
          4: { cellWidth: 13 },
          5: { cellWidth: 19 },
          6: { cellWidth: 19 },
          7: { cellWidth: 19 },
          8: { cellWidth: 19 },
          9: { cellWidth: 25 },
        }
      });

      y = doc.lastAutoTable.finalY + 15;

      checkPageSpace(35);
      doc.setDrawColor(230, 0, 0);
      doc.setLineWidth(1);
      doc.line(margin, y + 5, pageWidth - margin, y + 5);

      y += 15;
      const firmaWidth = (pageWidth - 3 * margin) / 2;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, firmaWidth, 18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(108, 122, 137);
      doc.text('FIRMA DEL CLIENTE', margin + firmaWidth / 2, y + 13, { align: 'center' });
      doc.rect(margin + firmaWidth + margin, y, firmaWidth, 18);
      doc.text('HUELLA DACTILAR', margin + firmaWidth + margin + firmaWidth / 2, y + 13, { align: 'center' });

      y += 23;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`Documento generado automáticamente el ${fechaActual}`, pageWidth / 2, y, { align: 'center' });
      if (selectedClientData) {
        doc.text(`ID Cliente: ${selectedClient}`, pageWidth / 2, y + 3, { align: 'center' });
      }

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
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

  useEffect(() => {
    generateElegantPDF();
  }, []);

  return isGenerating ? <FetchWithGif /> : null;
};

export default InstallmentReportViewer;