import { formatCurrency, formatDate } from './utils';

interface OrderForReceipt {
  id: number;
  order_number: string;
  table_id: number;
  total_amount: number;
  submitted_at: string;
  items: Array<{
    item_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

export function printReceipt(order: OrderForReceipt) {
  const receiptContent = `
    <html>
      <head>
        <title>Receipt - ${order.order_number}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            max-width: 300px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 18px;
            margin: 0;
            font-weight: bold;
          }
          .header p {
            margin: 5px 0;
            font-size: 10px;
          }
          .divider {
            border-bottom: 1px dashed #000;
            margin: 10px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .item {
            margin: 8px 0;
          }
          .item-name {
            font-weight: bold;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-top: 2px;
          }
          .total {
            font-weight: bold;
            font-size: 14px;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
          }
          @media print {
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CAFE POS</h1>
          <p>Receipt</p>
          <div class="divider"></div>
        </div>
        
        <div class="info">
          <div class="info-row">
            <span>Order:</span>
            <span>${order.order_number}</span>
          </div>
          <div class="info-row">
            <span>Table:</span>
            <span>${order.table_id}</span>
          </div>
          <div class="info-row">
            <span>Date:</span>
            <span>${formatDate(order.submitted_at)}</span>
          </div>
          <div class="divider"></div>
        </div>
        
        <div class="items">
          ${order.items.map(item => `
            <div class="item">
              <div class="item-name">${item.item_name}</div>
              <div class="item-details">
                <span>${item.quantity} x ${formatCurrency(item.unit_price)}</span>
                <span>${formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          `).join('')}
          <div class="divider"></div>
        </div>
        
        <div class="info-row total">
          <span>TOTAL:</span>
          <span>${formatCurrency(order.total_amount)}</span>
        </div>
        <div class="divider"></div>
        
        <div class="footer">
          <p>Thank you for your visit!</p>
          <p>Please come again</p>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
}
