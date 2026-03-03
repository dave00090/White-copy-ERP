import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '../types';

const COMPANY_INFO = {
  address: "Kiamumbi\nMaziwa Stage",
  poBox: "...................",
  mobile: "0720-248732\n0733-593995",
  tel: "........................",
  deliveryMobile1: "0733 593 995",
  deliveryMobile2: "0733 838 557",
  location: "Kiamumbi maziwa\nStage shop 4\nNairobi"
};

const BLUE_BRAND = [30, 64, 124];

export const generateDocumentPDF = (invoice: Invoice, type: 'Invoice' | 'Delivery Note') => {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFont("helvetica", "bold");

  if (type === 'Invoice') {
    // --- INVOICE TEMPLATE ---
    // Top Label Box: Now White background with Blue border as requested
    doc.setDrawColor(BLUE_BRAND[0], BLUE_BRAND[1], BLUE_BRAND[2]);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth / 2 - 20, 10, 40, 10, 2, 2, 'FD');
    doc.setTextColor(BLUE_BRAND[0], BLUE_BRAND[1], BLUE_BRAND[2]);
    doc.setFontSize(11);
    doc.text("INVOICE", pageWidth / 2, 17, { align: 'center' });

    doc.setTextColor(BLUE_BRAND[0], BLUE_BRAND[1], BLUE_BRAND[2]);
    doc.setFontSize(26);
    doc.text("WHITE COPY ENTERPRISES", margin, 35);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Dealers in, Repair of office equipment, Riso, Ricoh and Photocopiers", margin, 41);
    doc.text("stationers & supply", margin, 46);

    doc.text(`P.O. Box ${COMPANY_INFO.poBox}`, pageWidth - margin, 41, { align: 'right' });
    doc.text(`Mobile: ${COMPANY_INFO.mobile.split('\n')[0]}`, pageWidth - margin, 46, { align: 'right' });
    doc.text(`${COMPANY_INFO.mobile.split('\n')[1]}`, pageWidth - margin, 51, { align: 'right' });
    doc.text(`Tel: ${COMPANY_INFO.tel}`, pageWidth - margin, 56, { align: 'right' });

    doc.text("Kiamumbi", margin, 51);
    doc.text("Maziwa Stage", margin, 56);

    // 1. Reset colors to Blue border and White fill to prevent "Black Patches"
    doc.setDrawColor(BLUE_BRAND[0], BLUE_BRAND[1], BLUE_BRAND[2]);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.5);
    // 2. Draw the Client Box (Left side)
    doc.roundedRect(margin, 65, 90, 25, 3, 3, 'FD');
    doc.setTextColor(0, 0, 0); // Black text for the content
    doc.text(`M/s: ${invoice.clientName}`, margin + 5, 72);
    // 3. Draw the Date/Ref Box (Right side)
    // We move the text slightly lower (74 instead of 72) to ensure it is centered in the box
    doc.roundedRect(pageWidth - margin - 65, 65, 65, 25, 2, 2, 'FD');
    doc.text(`Date: ${invoice.date}`, pageWidth - margin - 60, 74);
    doc.text(`D/Note No: ${invoice.deliveryNoteNumber}`, pageWidth - margin - 60, 80);
    doc.text(`Order No: ${invoice.invoiceNumber}`, pageWidth - margin - 60, 86);

    autoTable(doc, {
      startY: 95,
      head: [['Qty', 'Particular', '@', 'Shs.', 'Cts.']],
      body: invoice.items.map(item => [
        item.quantity,
        item.productName,
        item.unitPrice.toLocaleString(),
        item.totalPrice.toLocaleString(),
        "00"
      ]),
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.2, lineColor: BLUE_BRAND },
      styles: { textColor: [0, 0, 0], fontSize: 9, cellPadding: 3, lineColor: BLUE_BRAND },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 12, halign: 'center' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFont("helvetica", "normal");
    doc.text("E.&O.E.   No.", margin, finalY + 10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); 
    doc.text(`TOTAL: ${invoice.total.toLocaleString()}`, pageWidth - margin, finalY + 10, { align: 'right' });

    doc.setFontSize(8);
    doc.text("CONDITIONS FOR SALE", margin, finalY + 25);
    doc.setFont("helvetica", "normal");
    const conditions = [
      "1. Goods once sold are not returnable",
      "2. Any queries regarding this Invoice must be made immediately otherwise this Invoice will be considered confirmed",
      "3. Supply of goods will be stopped if full payment has not been received immediately / within thirty days from date of Invoice"
    ];
    doc.text(conditions[0], margin, finalY + 31);
    doc.text(conditions[1], margin, finalY + 36, { maxWidth: 180 });
    doc.text(conditions[2], margin, finalY + 41, { maxWidth: 180 });

  } else {
    // --- DELIVERY NOTE TEMPLATE ---
    doc.setDrawColor(BLUE_BRAND[0], BLUE_BRAND[1], BLUE_BRAND[2]);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth / 2 - 25, 10, 50, 10, 2, 2, 'FD');
    doc.setTextColor(BLUE_BRAND[0], BLUE_BRAND[1], BLUE_BRAND[2]);
    doc.setFontSize(11);
    doc.text("DELIVERY NOTE", pageWidth / 2, 17, { align: 'center' });

    doc.setTextColor(BLUE_BRAND[0], BLUE_BRAND[1], BLUE_BRAND[2]);
    doc.setFontSize(26);
    doc.text("WHITE COPY ENTERPRISES", margin, 35);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.text("Dealers in: Photocopying, Repair, Office Equipment, Stationeries & Supply", margin, 41);
    doc.text("Kiamumbi maziwa", margin, 46);
    doc.text("Stage shop 4", margin, 51);
    doc.text("Nairobi", margin, 56);

    doc.text(`P.O. Box ${COMPANY_INFO.poBox}`, pageWidth - margin, 41, { align: 'right' });
    doc.text(`Mobile: ${COMPANY_INFO.deliveryMobile1}`, pageWidth - margin, 46, { align: 'right' });
    doc.text(`${COMPANY_INFO.deliveryMobile2}`, pageWidth - margin, 51, { align: 'right' });

    doc.setDrawColor(BLUE_BRAND[0], BLUE_BRAND[1], BLUE_BRAND[2]);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 65, 90, 25, 3, 3, 'FD');
    doc.setTextColor(0, 0, 0);
    doc.text(`M/s: ${invoice.clientName}`, margin + 5, 72);

    doc.roundedRect(pageWidth - margin - 65, 65, 65, 25, 2, 2, 'FD');
    doc.text(`Date: ${invoice.date}`, pageWidth - margin - 60, 72);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, pageWidth - margin - 60, 78);
    doc.text(`L.P.O: ${invoice.deliveryNoteNumber}`, pageWidth - margin - 60, 84);

    doc.setFont("helvetica", "bold");
    doc.text("Please Receive the following goods in good order and condition", margin, 100);

    autoTable(doc, {
      startY: 105,
      head: [['QTY', 'DESCRIPTION']],
      body: invoice.items.map(item => [item.quantity, item.productName]),
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineColor: BLUE_BRAND },
      styles: { textColor: [0, 0, 0], fontSize: 9, cellPadding: 3, lineColor: BLUE_BRAND },
      columnStyles: { 0: { cellWidth: 20, halign: 'center' } }
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.text("E.&O.E. No.", margin, finalY + 10);
    doc.setFontSize(8);
    doc.text("CONDITIONS FOR SALE", margin, finalY + 25);
    doc.setFont("helvetica", "normal");
    doc.text("1. Goods once sold are not returnable.", margin, finalY + 31);
    doc.text("2. Ensure the goods are in good order before signing the document.", margin, finalY + 36);
    doc.text("3. Supply of goods will be stopped if full payment has not been received immediately / within thirty days from date of Invoice.", margin, finalY + 41, { maxWidth: 180 });

    doc.setFont("helvetica", "italic");
    doc.text("Received the above goods in good order and condition", margin, finalY + 55);
    doc.setFont("helvetica", "normal");
    doc.text("Received by: ...........................................", margin, finalY + 70);
    doc.text("Signature: ...........................................", pageWidth - margin, finalY + 70, { align: 'right' });
    doc.setTextColor(150, 150, 150);
    doc.text("Official Rubber Stamp", pageWidth - margin, finalY + 80, { align: 'right' });
  }

  // Files will download to default browser folder with dynamic naming
  doc.save(`White_Copy_${type.replace(' ', '_')}_${invoice.invoiceNumber}.pdf`);
};