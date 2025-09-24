'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface OutstandingOrder {
  id: number;
  order_number: string;
  table_id: number;
  total_amount: number;
  submitted_at: string;
  items: Array<{
    id: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

interface PaymentForm {
  orderId: number;
  paymentMethod: 'CASH' | 'QRIS' | 'CARD';
  amountTendered: number;
  notes: string;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams?.get('orderId');
  const { showToast, ToastContainer } = useToast();

  const [outstandingOrders, setOutstandingOrders] = useState<OutstandingOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OutstandingOrder | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    orderId: 0,
    paymentMethod: 'CASH',
    amountTendered: 0,
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOutstandingOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders/outstanding');
      const data = await response.json();
      setOutstandingOrders(data.orders || data || []);
    } catch (error) {
      console.error('Failed to fetch outstanding orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectOrder = useCallback((order: OutstandingOrder) => {
    setSelectedOrder(order);
    setPaymentForm(prev => ({
      ...prev,
      orderId: order.id,
      amountTendered: order.total_amount
    }));
    showToast(`Selected order ${order.order_number} for payment`, 'info');
  }, [showToast]);

  useEffect(() => {
    fetchOutstandingOrders();
  }, [fetchOutstandingOrders]);

  useEffect(() => {
    if (preselectedOrderId && outstandingOrders.length > 0) {
      const order = outstandingOrders.find(o => o.id.toString() === preselectedOrderId);
      if (order) {
        selectOrder(order);
      }
    }
  }, [preselectedOrderId, outstandingOrders, selectOrder]);

  const handlePaymentMethodChange = (method: 'CASH' | 'QRIS' | 'CARD') => {
    setPaymentForm(prev => ({
      ...prev,
      paymentMethod: method,
      amountTendered: method === 'CASH' ? prev.amountTendered : selectedOrder?.total_amount || 0
    }));
  };

  const processPayment = async () => {
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      const staff = JSON.parse(localStorage.getItem('staff_auth') || '{}');

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          paymentMethod: paymentForm.paymentMethod,
          amount: selectedOrder.total_amount,
          amountTendered: paymentForm.amountTendered,
          processedBy: staff.username || 'staff',
          notes: paymentForm.notes
        })
      });

      const result = await response.json();

      if (result.success) {
        const successMessage = `Payment processed successfully! Payment Number: ${result.paymentNumber}${
          result.changeAmount > 0 ? ` | Change: ${formatCurrency(result.changeAmount)}` : ''
        }`;
        showToast(successMessage, 'success');

        // Reset form and refresh orders
        setSelectedOrder(null);
        setPaymentForm({
          orderId: 0,
          paymentMethod: 'CASH',
          amountTendered: 0,
          notes: ''
        });
        fetchOutstandingOrders();
      } else {
        showToast('Payment failed: ' + result.error, 'error');
      }
    } catch {
      showToast('Payment processing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateChange = () => {
    if (paymentForm.paymentMethod !== 'CASH' || !selectedOrder) return 0;
    return Math.max(0, paymentForm.amountTendered - selectedOrder.total_amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Outstanding Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Outstanding Orders</h2>
          <p className="text-sm text-gray-700 mt-1">Select an order to process payment</p>
        </div>
        <div className="p-6">
          {outstandingOrders.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All payments processed!</h3>
              <p className="text-gray-700">No outstanding orders require payment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {outstandingOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => selectOrder(order)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOrder?.id === order.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                      <p className="text-sm text-gray-700">
                        Table {order.table_id} • {new Date(order.submitted_at).toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-gray-800 mt-1">
                        {order.items.length} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Outstanding
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Processing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Process Payment</h2>
          {selectedOrder && (
            <p className="text-sm text-gray-700 mt-1">
              Processing payment for {selectedOrder.order_number}
            </p>
          )}
        </div>
        <div className="p-6">
          {!selectedOrder ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Order</h3>
              <p className="text-gray-700">Choose an outstanding order to process payment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-800">
                      <span>{item.quantity}x {item.item_name}</span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'CASH', label: 'Cash', icon: '💵' },
                    { key: 'QRIS', label: 'QRIS', icon: '📱' },
                    { key: 'CARD', label: 'Card', icon: '💳' }
                  ].map((method) => (
                    <button
                      key={method.key}
                      onClick={() => handlePaymentMethodChange(method.key as 'CASH' | 'QRIS' | 'CARD')}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        paymentForm.paymentMethod === method.key
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-800'
                      }`}
                    >
                      <div className="text-2xl mb-1">{method.icon}</div>
                      <div className="text-sm font-medium">{method.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Tendered (Cash only) */}
              {paymentForm.paymentMethod === 'CASH' && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Amount Tendered
                  </label>
                  <input
                    type="number"
                    min={selectedOrder.total_amount}
                    step="1000"
                    value={paymentForm.amountTendered}
                    onChange={(e) => setPaymentForm(prev => ({
                      ...prev,
                      amountTendered: Number(e.target.value)
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium text-gray-900"
                    placeholder="Enter amount received"
                  />
                  {paymentForm.amountTendered > 0 && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between text-sm text-green-800">
                        <span>Change:</span>
                        <span className="font-bold">{formatCurrency(calculateChange())}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Add any notes about this payment..."
                />
              </div>

              {/* Process Payment Button */}
              <button
                onClick={processPayment}
                disabled={isProcessing || (paymentForm.paymentMethod === 'CASH' && paymentForm.amountTendered < selectedOrder.total_amount)}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </div>
                ) : (
                  `Process Payment - ${formatCurrency(selectedOrder.total_amount)}`
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}