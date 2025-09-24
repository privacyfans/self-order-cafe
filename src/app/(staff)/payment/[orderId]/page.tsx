'use client';

import { useEffect, useState } from 'react';
import { Order, OrderItem } from '@/types';

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

  useEffect(() => {
    params.then(({ orderId }) => {
      fetchOrderDetails(orderId);
    });
  }, [params]);

  const fetchOrderDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();
      
      if (data.order) {
        setOrder(data.order);
        setOrderItems(data.items || []);
        setAmountTendered(data.order.total_amount.toString());
      }
    } catch (error) {
      console.error('Error fetching order:', error);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod,
          amount: order.total_amount,
          amountTendered: tenderedAmount,
          processedBy: 'staff' // In real app, get from auth
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Payment berhasil! ${paymentMethod === 'CASH' ? `Kembalian: Rp ${result.changeAmount.toLocaleString('id-ID')}` : ''}`);
        window.location.href = '/staff/dashboard';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600">Order not found</div>
      </div>
    );
  }

  const changeAmount = paymentMethod === 'CASH' 
    ? Math.max(0, parseFloat(amountTendered || '0') - order.total_amount)
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Order Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Order Number:</span>
            <span className="font-medium">{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Table:</span>
            <span>Meja {order.table_id}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{new Date(order.submitted_at).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
        <div className="space-y-2">
          {orderItems.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.item_name}</span>
              <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>Rp {order.total_amount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment</h3>
        
        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['CASH', 'QRIS', 'CARD'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`p-3 text-sm font-medium rounded-md border ${
                  paymentMethod === method
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Tendered (for CASH only) */}
        {paymentMethod === 'CASH' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Tendered
            </label>
            <input
              type="number"
              value={amountTendered}
              onChange={(e) => setAmountTendered(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount received"
            />
            {changeAmount > 0 && (
              <div className="mt-2 text-sm text-green-600">
                Change: Rp {changeAmount.toLocaleString('id-ID')}
              </div>
            )}
          </div>
        )}

        {/* Process Payment Button */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {processing ? 'Processing...' : `Process Payment - Rp ${order.total_amount.toLocaleString('id-ID')}`}
        </button>
      </div>
    </div>
  );
}
