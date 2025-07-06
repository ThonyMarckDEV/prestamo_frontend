import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { format, parseISO } from 'date-fns';
import FetchWithGif from '../../../../components/Reutilizables/FetchWithGif';
import logo from '../../../../img/logo/Logo_FICSULLANA.png';
import { toast } from 'react-toastify';

const PaymentReportViewer = ({
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

  const generateElegantPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
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

      const checkPageBreak = (requiredSpace) => {
        if (y + requiredSpace > pageHeight - 30) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      const addLogo = async () => {
        try {
          const logoBase64 = await getBase64FromImage(logo);
          const logoWidth = 50; // Increased size
          const logoHeight = 50;
          const logoX = (pageWidth - logoWidth) / 2; // Centered
          doc.addImage(logoBase64, 'PNG', logoX, y, logoWidth, logoHeight);
          return logoHeight;
        } catch (error) {
          console.warn('No se pudo cargar el logo');
          const logoWidth = 50;
          const logoHeight = 50;
          const logoX = (pageWidth - logoWidth) / 2;
          
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(230, 0, 0);
          doc.setLineWidth(1);
          doc.roundedRect(logoX, y, logoWidth, logoHeight, 3, 3, 'FD');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(230, 0, 0);
          doc.text('FICS', logoX + logoWidth / 2, y + 20, { align: 'center' });
          doc.text('ULLANA', logoX + logoWidth / 2, y + 30, { align: 'center' });
          
          return logoHeight;
        }
      };

      // ===========================================
      // HEADER SECTION
      // ===========================================
      
      // Fondo del header
      doc.setFillColor(245, 250, 255);
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      // Línea superior decorativa
      doc.setDrawColor(230, 0, 0);
      doc.setLineWidth(2);
      doc.line(0, 0, pageWidth, 0);

      // Logo
      const logoHeight = await addLogo();
      
      // Sistema de Gestión de Préstamos below logo
      y += logoHeight + 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(108, 122, 137);
      doc.text('Sistema de Gestión de Préstamos', pageWidth / 2, y, { align: 'center' });
      
      // Fecha de generación
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(108, 122, 137);
      const fechaActual = new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generado el ${fechaActual}`, pageWidth / 2, y, { align: 'center' });
      
      // Línea separadora
      y += 10;
      doc.setDrawColor(230, 0, 0);
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);
      
      y += 15;

      // ===========================================
      // SECCIÓN DE FILTROS
      // ===========================================
      
      checkPageBreak(50);
      
      // Título de la sección
      doc.setFillColor(230, 0, 0);
      doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('INFORMACIÓN DE FILTROS APLICADOS', margin + 5, y + 5.5);
      
      y += 12;
      
      // Fondo para la información de filtros
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y, pageWidth - 2 * margin, 30, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, pageWidth - 2 * margin, 30);
      
      y += 8;
      
      const selectedAsesorData = asesores.find(asesor => asesor.id === parseInt(selectedAsesor));
      
      // Información de filtros en dos columnas
      const filterInfo = [
        { label: 'Periodo', value: `${startDate ? formatDate(startDate) : 'No especificado'} - ${endDate ? formatDate(endDate) : 'No especificado'}` },
        { label: 'Estado', value: estado || 'TODOS LOS ESTADOS' },
        { label: 'Asesor', value: selectedAsesorData ? selectedAsesorData.nombre : 'TODOS LOS ASESORES' },
        { label: 'Grupo', value: selectedGroup || 'TODOS LOS GRUPOS' },
        { label: 'Total de registros', value: cuotas.length.toString() },
      ];
      
      filterInfo.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const xPos = margin + 8 + col * ((pageWidth - 2 * margin) / 2);
        const yPos = y + row * 7;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(`${item.label}:`, xPos, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(44, 62, 80);
        const maxWidth = (pageWidth - 2 * margin) / 2 - 20;
        const wrappedText = doc.splitTextToSize(item.value, maxWidth);
        doc.text(wrappedText[0], xPos + 40, yPos);
      });
      
      y += 35;

      // ===========================================
      // SECCIÓN DE DETALLES DE PAGOS
      // ===========================================
      
      checkPageBreak(20);
      
      // Título de la sección
      doc.setFillColor(230, 0, 0);
      doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('DETALLES DE PAGOS', margin + 5, y + 5.5);
      
      y += 15;

      // Dibujar cada cuota (SIN FONDOS NI BORDES)
      cuotas.forEach((cuota, index) => {
        const cardHeight = 60; // Reducido un poco sin el fondo
        checkPageBreak(cardHeight + 10);
        
        // Header de la cuota (solo el texto, sin fondo)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(44, 62, 80);
        doc.text(`CUOTA #${cuota.numero_cuota} - ${cuota.cliente_nombre} (DNI: ${cuota.cliente_dni})`, margin + 5, y + 7);
        
        y += 12;
        
        // Información de la cuota en formato organizado
        const cuotaInfo = [
          { label: 'ID Préstamo', value: cuota.idPrestamo.toString() },
          { label: 'Fecha Vencimiento', value: formatDate(cuota.fecha_vencimiento) },
          { label: 'Capital', value: `S/ ${parseFloat(cuota.capital).toFixed(2)}` },
          { label: 'Interés', value: `S/ ${parseFloat(cuota.interes).toFixed(2)}` },
          { label: 'Otros Conceptos', value: `S/ ${(cuota.otros !== null ? parseFloat(cuota.otros) : parseFloat(cuota.monto) - parseFloat(cuota.capital) - parseFloat(cuota.interes)).toFixed(2)}` },
          { label: 'Monto Total', value: `S/ ${parseFloat(cuota.monto).toFixed(2)}` },
          { label: 'Días de Mora', value: cuota.dias_mora.toString() },
          { label: 'Mora', value: cuota.mora_reducida > 0 ? `S/ ${parseFloat(cuota.mora || 0).toFixed(2)} (-${cuota.mora_reducida}%)` : `S/ ${parseFloat(cuota.mora || 0).toFixed(2)}` },
          { label: 'Estado', value: cuota.estado },
          { label: 'Asesor', value: cuota.asesor_nombre },
        ];
        
        cuotaInfo.forEach((item, idx) => {
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
        
        // Observaciones (si existen)
        if (cuota.observaciones && cuota.observaciones.trim() !== '') {
          y += 45;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text('Observaciones:', margin + 8, y);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(44, 62, 80);
          const obsText = doc.splitTextToSize(cuota.observaciones, pageWidth - 2 * margin - 50);
          doc.text(obsText, margin + 50, y);
          y += 10;
        } else {
          y += 45;
        }
        
        
        y += 20; // Espacio entre cuotas
      });

      // ===========================================
      // SECCIÓN DE TOTALES
      // ===========================================
      
      checkPageBreak(50);
      
      // Título de totales
      doc.setFillColor(230, 0, 0);
      doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('RESUMEN TOTAL', margin + 5, y + 5.5);
      
      y += 12;
      
      // Fondo para totales
      doc.setFillColor(255, 250, 240);
      doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F');
      doc.setDrawColor(230, 0, 0);
      doc.setLineWidth(1);
      doc.rect(margin, y, pageWidth - 2 * margin, 25);
      
      y += 8;
      
      const totales = [
        { label: 'Total Capital', value: `S/ ${cuotas.reduce((sum, c) => sum + parseFloat(c.capital), 0).toFixed(2)}` },
        { label: 'Total Interés', value: `S/ ${cuotas.reduce((sum, c) => sum + parseFloat(c.interes), 0).toFixed(2)}` },
        { label: 'Total Otros', value: `S/ ${cuotas.reduce((sum, c) => sum + (c.otros !== null ? parseFloat(c.otros) : parseFloat(c.monto) - parseFloat(c.capital) - parseFloat(c.interes)), 0).toFixed(2)}` },
        { label: 'GRAN TOTAL', value: `S/ ${cuotas.reduce((sum, c) => sum + parseFloat(c.monto), 0).toFixed(2)}` },
      ];
      
      totales.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const xPos = margin + 10 + col * ((pageWidth - 2 * margin) / 2);
        const yPos = y + row * 8;
        
        const isGrandTotal = item.label === 'GRAN TOTAL';
        
        doc.setFont('helvetica', isGrandTotal ? 'bold' : 'bold');
        doc.setFontSize(isGrandTotal ? 10 : 9);
        doc.setTextColor(isGrandTotal ? 230 : 80, isGrandTotal ? 0 : 80, isGrandTotal ? 0 : 80);
        doc.text(`${item.label}:`, xPos, yPos);
        
        doc.setFont('helvetica', isGrandTotal ? 'bold' : 'normal');
        doc.setFontSize(isGrandTotal ? 10 : 9);
        doc.setTextColor(isGrandTotal ? 230 : 44, isGrandTotal ? 0 : 62, isGrandTotal ? 0 : 80);
        doc.text(item.value, xPos + 50, yPos);
      });
      
      y += 35;

      // ===========================================
      // PIE DE PÁGINA
      // ===========================================
      
      checkPageBreak(40);
      
      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      
      y += 10;
      
      // Sección de firmas
      const firmaWidth = (pageWidth - 3 * margin) / 2;
      
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, firmaWidth, 20);
      doc.rect(margin + firmaWidth + margin, y, firmaWidth, 20);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('FIRMA DEL CLIENTE', margin + firmaWidth / 2, y + 15, { align: 'center' });
      doc.text('HUELLA DACTILAR', margin + firmaWidth + margin + firmaWidth / 2, y + 15, { align: 'center' });
      
      y += 30;
      
      // Información final
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Documento generado automáticamente el ${fechaActual}`, pageWidth / 2, y, { align: 'center' });
      doc.text('FICS ULLANA - Sistema de Gestión de Préstamos', pageWidth / 2, y + 5, { align: 'center' });

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

  useEffect(() => {
    generateElegantPDF();
  }, []);

  return isGenerating ? <FetchWithGif /> : null;
};

export default PaymentReportViewer;