import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function generatePDF(data: any) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Sales Report', 20, 20);
  doc.setFontSize(12);
  doc.text(`Period: ${data.dateRange.startDate} to ${data.dateRange.endDate}`, 20, 30);
  
  // Summary
  doc.setFontSize(14);
  doc.text('Summary', 20, 45);
  doc.setFontSize(10);
  doc.text(`Total Orders: ${data.summary.total_orders || 0}`, 20, 55);
  doc.text(`Total Revenue: Rp ${(data.summary.total_revenue || 0).toLocaleString('id-ID')}`, 20, 65);
  doc.text(`Average Order: Rp ${(data.summary.avg_order_value || 0).toLocaleString('id-ID')}`, 20, 75);
  
  // Orders table
  const orderRows = data.orders.map((order: any) => [
    order.order_number || '',
    `Table ${order.table_id || ''}`,
    `Rp ${(order.total_amount || 0).toLocaleString('id-ID')}`,
    order.payment_method || 'N/A',
    new Date(order.submitted_at).toLocaleString('id-ID')
  ]);

  if (orderRows.length > 0) {
    doc.autoTable({
      head: [['Order #', 'Table', 'Amount', 'Payment', 'Date']],
      body: orderRows,
      startY: 85,
      styles: { fontSize: 8 }
    });
  }

  return Buffer.from(doc.output('arraybuffer'));
}
