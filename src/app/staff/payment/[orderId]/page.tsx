'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Payment } from '@/types';

interface Order {
  id: number;
  order_number: string;
  table_id: number;
  total_amount: number;
  submitted_at: string;
}

interface OrderItem {
  id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface PaymentPageProps {
  params: Promise<{ orderId: string }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'CARD'>('CASH');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentResult, setPaymentResult] = useState<Payment | null>(null);

  useEffect(() => {
    params.then(({ orderId }) => {
      fetchOrder(orderId);
    });
  }, [params]);

  const fetchOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();
      if (data.order) {
        setOrder(data.order);
        setOrderItems(data.items || []);
        setAmountTendered(data.order.total_amount.toString());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    const tenderedAmount = parseFloat(amountTendered);
    if (paymentMethod === 'CASH' && tenderedAmount < order.total_amount) {
      alert('Jumlah uang tidak mencukupi');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod,
          amount: order.total_amount,
          amountTendered: tenderedAmount,
          processedBy: 'staff'
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPaymentResult(result);
        setShowReceipt(true);
      } else {
        alert('Payment gagal: ' + result.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Terjadi kesalahan saat memproses payment');
    } finally {
      setProcessing(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const changeAmount = paymentMethod === 'CASH' 
    ? Math.max(0, parseFloat(amountTendered || '0') - (order?.total_amount || 0))
    : 0;

  if (loading) return <div className="p-8 text-gray-900">Loading...</div>;
  if (!order) return <div className="p-8 text-red-600">Order not found</div>;

  if (showReceipt) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto">
          {/* Receipt */}
          <div id="receipt" className="bg-white p-6 rounded-lg shadow mb-4 print:shadow-none print:rounded-none">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold text-gray-900">CAFE DIGITAL</h1>
              <p className="text-sm text-gray-600">Jl. Contoh No. 123</p>
              <p className="text-sm text-gray-600">Tel: (021) 1234-5678</p>
              <div className="border-t border-dashed border-gray-400 my-2"></div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Order:</span>
                <span className="font-semibold text-gray-900">{order.order_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Table:</span>
                <span className="font-semibold text-gray-900">{order.table_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Date:</span>
                <span className="font-semibold text-gray-900">{new Date().toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Time:</span>
                <span className="font-semibold text-gray-900">{new Date().toLocaleTimeString('id-ID')}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-2"></div>

            <div className="mb-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm mb-1">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.quantity}x {item.item_name}</div>
                    <div className="text-gray-600 text-xs">@{formatCurrency(item.unit_price)}</div>
                  </div>
                  <div className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-400 my-2"></div>

            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-900">Rp {order.total_amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">TOTAL:</span>
                <span className="text-gray-900">Rp {order.total_amount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-2"></div>

            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Payment Method:</span>
                <span className="font-semibold text-gray-900">{paymentMethod}</span>
              </div>
              {paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Amount Tendered:</span>
                    <span className="font-semibold text-gray-900">Rp {parseFloat(amountTendered).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Change:</span>
                    <span className="font-semibold text-gray-900">Rp {changeAmount.toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center text-sm text-gray-600 mt-4">
              <p>Terima kasih atas kunjungan Anda!</p>
              <p>Payment ID: {paymentResult?.payment_number}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 print:hidden">
            <button
              onClick={printReceipt}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              🖨️ Print Receipt
            </button>
            <button
              onClick={() => window.location.href = '/staff/dashboard'}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 page-transition">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Process Payment</h1>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold text-gray-700">Order: <span className="text-gray-900">{order.order_number}</span></div>
          <div className="text-sm font-semibold text-gray-700">Table: <span className="text-gray-900">{order.table_id}</span></div>
          <div className="text-lg font-bold text-blue-600">Total: {formatCurrency(order.total_amount)}</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {(['CASH', 'QRIS', 'CARD'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`p-2 text-sm font-medium rounded border ${
                  paymentMethod === method 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'CASH' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount Tendered</label>
            <input
              type="number"
              value={amountTendered}
              onChange={(e) => setAmountTendered(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-gray-900 font-medium"
              placeholder="Enter amount received"
            />
            {changeAmount > 0 && (
              <div className="mt-2 text-sm font-semibold text-green-600">
                Change: {formatCurrency(changeAmount)}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Process Payment'}
        </button>
      </div>
    </div>
  );
}
