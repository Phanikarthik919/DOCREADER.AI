import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FullInvoice } from './types';

export const createEmptyInvoice = (fileName: string): FullInvoice => ({
  fileName,
  vendor: { name: '', address: '', taxId: '' },
  invoice: {
    number: '',
    date: '',
    currency: '$',
    subtotal: 0,
    taxPercent: 0,
    total: 0,
    poNumber: '',
    poDate: '',
  },
  lineItems: [{
    id: crypto.randomUUID(),
    description: '',
    unitPrice: 0,
    quantity: 1,
    total: 0,
  }],
});

export const handleDownloadPdf = (invoiceToDownload?: FullInvoice) => {
  const invoice = invoiceToDownload;
  if (!invoice) return;

  const doc = new jsPDF();
  const { vendor, invoice: inv, lineItems } = invoice;

  doc.setProperties({ title: `Invoice ${inv.number}` });
  doc.setFontSize(22);
  doc.text("INVOICE", 105, 20, { align: "center" });
  doc.setFontSize(11);
  doc.text(`From:\n${vendor.name}\n${vendor.address}`, 14, 40);
  doc.text(`Invoice #: ${inv.number}\nDate: ${inv.date}`, 196, 40, { align: "right" });

  autoTable(doc, {
    head: [["Description", "Qty", "Unit Price", "Total"]],
    headStyles: { halign: 'center' },
    body: lineItems.map(li => [
      li.description,
      li.quantity,
      li.unitPrice.toFixed(2),
      li.total.toFixed(2),
    ]),
    startY: 70,
  });

  const finalY = (doc as any).lastAutoTable.finalY;
  doc.text(`TOTAL: ${inv.currency}${inv.total.toFixed(2)}`, 196, finalY + 10, { align: "right" });
  doc.save(`Invoice-${inv.number}.pdf`);
};