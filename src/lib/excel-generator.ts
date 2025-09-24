import * as XLSX from 'xlsx';

export function generateExcel(data: any) {
  const wb = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Orders', data.summary.total_orders || 0],
    ['Total Revenue', data.summary.total_revenue || 0],
    ['Average Order Value', data.summary.avg_order_value || 0],
    ['Cash Revenue', data.summary.cash_total || 0],
    ['QRIS Revenue', data.summary.qris_total || 0],
    ['Card Revenue', data.summary.card_total || 0]
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Orders sheet
  const orderData = [
    ['Order Number', 'Table', 'Amount', 'Payment Method', 'Status', 'Date', 'Items']
  ];
  data.orders.forEach((order: any) => {
    orderData.push([
      order.order_number || '',
      order.table_id || '',
      order.total_amount || 0,
      order.payment_method || 'N/A',
      order.payment_status || '',
      new Date(order.submitted_at).toLocaleString('id-ID'),
      order.items || ''
    ]);
  });
  const ordersWs = XLSX.utils.aoa_to_sheet(orderData);
  XLSX.utils.book_append_sheet(wb, ordersWs, 'Orders');
  
  // Top Items sheet
  const itemsData = [['Item Name', 'Quantity Sold', 'Revenue']];
  data.topItems.forEach((item: any) => {
    itemsData.push([item.item_name, item.total_quantity, item.total_revenue]);
  });
  const itemsWs = XLSX.utils.aoa_to_sheet(itemsData);
  XLSX.utils.book_append_sheet(wb, itemsWs, 'Top Items');
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
