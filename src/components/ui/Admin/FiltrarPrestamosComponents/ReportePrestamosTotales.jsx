import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { format, parseISO } from 'date-fns';
import FetchWithGif from '../../../../components/Reutilizables/FetchWithGif';
import logo from '../../../../img/logo/Logo_FICSULLANA.png';
import { toast } from 'react-toastify';

const LoanReportViewer = ({ loans, selectedClient, clients, asesores, selectedAsesor, onComplete, onPDFGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const formatDate = (dateString) => {
    try {
      if (!dateString || typeof dateString !== 'string') return '-';
      const parsedDate = parseISO(dateString);
      if (isNaN(parsedDate)) return '-';
      return format(parsedDate, 'dd/MM/yyyy');
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

      // Header Section
      doc.setFillColor(240, 248, 255);
      doc.rect(0, 0, pageWidth, 70, 'F');
      doc.setLineWidth(3);
      doc.setDrawColor(230, 0, 0);
      doc.line(0, 0, pageWidth, 0);

      await addLogo();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80);
      doc.text('REPORTE DE PRÉSTAMOS', pageWidth / 2, 55, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(108, 122, 137);
      const fechaActual = new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generado el ${fechaActual}`, pageWidth / 2, 60, { align: 'center' });

      y = 78;

      // Client Info Section
      const selectedClientData = clients.find(client => client.idUsuario === selectedClient);
      if (selectedClientData) {
        drawSection('1. INFORMACIÓN DEL CLIENTE');
        const clientInfo = [
          { label: 'Nombre Completo', value: `${selectedClientData.nombre} ${selectedClientData.apellidoPaterno} ${selectedClientData.apellidoMaterno}` },
          { label: 'DNI', value: selectedClientData.dni },
          { label: 'ID Cliente', value: selectedClient }
        ];
        drawInfoBox(clientInfo, 22);
      }

      // Loans Section
      drawSection('2. DETALLES DE PRÉSTAMOS');

      loans.forEach((loan, index) => {
        const cardHeight = 60;
        checkPageSpace(cardHeight + 10);

        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(44, 62, 80);
        doc.text(`Préstamo #${loan.idPrestamo}`, margin + 5, y + 7);

        y += 12;

        const loanInfo = [
          { label: 'ID Préstamo', value: loan.idPrestamo.toString() },
          { label: 'Producto', value: loan.producto ? `${loan.producto}` : '-' },
          { label: 'Abonado Por', value: loan.abonado_por || '-' },
          { label: 'Monto', value: `S/ ${parseFloat(loan.monto).toFixed(2)}` },
          { label: 'Total', value: `S/ ${parseFloat(loan.total).toFixed(2)}` },
          { label: 'Cuotas', value: loan.cuotas.toString() },
          { label: 'Valor Cuota', value: `S/ ${parseFloat(loan.valor_cuota).toFixed(2)}` },
          { label: 'Frecuencia', value: loan.frecuencia || '-' },
          { label: 'Fecha Inicio', value: formatDate(loan.fecha_inicio) },
          { label: 'Estado', value: loan.estado || '-' },
          { label: 'Asesor', value: loan.asesor || '-' },
        ];

        loanInfo.forEach((item, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const xPos = margin + 8 + col * ((pageWidth - 2 * margin) / 2);
          const yPos = y + row * 8;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`${item.label}:`, xPos, yPos);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(44, 62, 80);
          const maxWidth = (pageWidth - 2 * margin) / 2 - 25;
          const wrappedText = doc.splitTextToSize(item.value, maxWidth);
          doc.text(wrappedText[0], xPos + 35, yPos);
        });

        y += 50;
        y += 20; // Space between cards
      });

      // Footer Section
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

export default LoanReportViewer;