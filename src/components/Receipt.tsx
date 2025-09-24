'use client';

import { formatCurrency, formatDate } from '@/lib/utils';

interface ReceiptProps {
  order: {
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
  };
}

export default function Receipt({ order }: ReceiptProps) {
  return (
    <div className="receipt-container max-w-sm mx-auto bg-white p-4 font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">CAFE POS</h1>
        <p className="text-xs">Receipt</p>
        <div className="border-b border-dashed border-gray-400 my-2"></div>
      </div>

      {/* Order Info */}
      <div className="mb-4">
        <div className="flex justify-between">
          <span>Order:</span>
          <span>{order.order_number}</span>
        </div>
        <div className="flex justify-between">
          <span>Table:</span>
          <span>{order.table_id}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDate(order.submitted_at)}</span>
        </div>
        <div className="border-b border-dashed border-gray-400 my-2"></div>
      </div>

      {/* Items */}
      <div className="mb-4">
        {order.items.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between">
              <span>{item.item_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>{item.quantity} x {formatCurrency(item.unit_price)}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          </div>
        ))}
        <div className="border-b border-dashed border-gray-400 my-2"></div>
      </div>

      {/* Total */}
      <div className="mb-4">
        <div className="flex justify-between font-bold text-base">
          <span>TOTAL:</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
        <div className="border-b border-dashed border-gray-400 my-2"></div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs">
        <p>Thank you for your visit!</p>
        <p>Please come again</p>
      </div>
    </div>
  );
}
