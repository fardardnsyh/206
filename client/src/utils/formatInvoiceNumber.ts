export default function formatInvoiceNumber(invoiceNumber: number) {
  return String(invoiceNumber).padStart(5, '0');
}

