'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { printReceipt } from '@/lib/print';

interface Order {
  id: number;
  order_number: string;
  table_id: number;
  order_status: string;
  payment_status: string;
  total_amount: number;
  submitted_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  status: string;
  special_instructions?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'outstanding' | 'completed'>('outstanding');
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      // Always fetch all orders for counts
      const allResponse = await fetch('/api/orders');
      const allData = await allResponse.json();
      const allOrdersData = allData.orders || allData || [];
      setAllOrders(allOrdersData);

      // Filter orders based on current filter
      let filteredOrders = allOrdersData;
      if (filter === 'outstanding') {
        filteredOrders = allOrdersData.filter((order: Order) => order.payment_status === 'OUTSTANDING');
      } else if (filter === 'completed') {
        filteredOrders = allOrdersData.filter((order: Order) => order.payment_status === 'PAID');
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: status })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const markItemAsServed = async (itemId: number) => {
    try {
      const response = await fetch('/api/orders/mark-item-served', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to mark item as served:', error);
    }
  };

  const markAllItemsAsServed = async (orderId: number) => {
    try {
      const response = await fetch('/api/orders/mark-all-served', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to mark all items as served:', error);
    }
  };

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <div className="flex space-x-1">
          {[
            { key: 'outstanding', label: 'Outstanding Orders', count: allOrders.filter(o => o.payment_status === 'OUTSTANDING').length },
            { key: 'all', label: 'All Orders', count: allOrders.length },
            { key: 'completed', label: 'Completed', count: allOrders.filter(o => o.payment_status === 'PAID').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'outstanding' | 'completed')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === tab.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                filter === tab.key
                  ? 'bg-indigo-200 text-indigo-800'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match the current filter.</p>
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const hasReadyItems = order.items?.some(item => item.status === 'READY');

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                  hasReadyItems
                    ? 'border-green-500 bg-green-50'
                    : order.payment_status === 'OUTSTANDING'
                      ? 'border-orange-200'
                      : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-indigo-600 font-bold">T{order.table_id}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                        <p className="text-sm text-gray-500">Table {order.table_id} • {formatDate(order.submitted_at)}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <StatusBadge status={order.order_status} type="order" />
                          <StatusBadge status={order.payment_status} type="payment" />
                          {hasReadyItems && (
                            <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                              Items Ready
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          {isExpanded ? 'Hide' : 'Show'} Items ({order.items?.length || 0})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {isExpanded && order.items && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {item.quantity}x {item.item_name}
                                </span>
                                <StatusBadge status={item.status} type="item" />
                              </div>
                              {item.special_instructions && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Note: {item.special_instructions}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                {formatCurrency(item.unit_price || 0)} each • Total: {formatCurrency(item.subtotal || 0)}
                              </p>
                            </div>

                            {item.status === 'READY' && (
                              <button
                                onClick={() => markItemAsServed(item.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                Mark Served
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      {order.order_status !== 'COMPLETED' && (
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="SUBMITTED">Submitted</option>
                          <option value="PREPARING">Preparing</option>
                          <option value="READY">Ready</option>
                          <option value="SERVED">Served</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {hasReadyItems && (
                        <button
                          onClick={() => markAllItemsAsServed(order.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          All Mark Served
                        </button>
                      )}
                      {order.payment_status === 'OUTSTANDING' && (
                        <button
                          onClick={() => window.open(`/staff/payment?orderId=${order.id}`, '_blank')}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Process Payment
                        </button>
                      )}
                      <button
                        onClick={() => printReceipt(order)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                      >
                        Print Receipt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, type }: { status: string; type: 'order' | 'payment' | 'item' }) {
  const getStatusColor = (status: string, type: string) => {
    if (type === 'order' || type === 'item') {
      switch (status) {
        case 'SUBMITTED':
        case 'PENDING': return 'bg-blue-100 text-blue-800';
        case 'PREPARING': return 'bg-yellow-100 text-yellow-800';
        case 'READY': return 'bg-green-100 text-green-800';
        case 'SERVED': return 'bg-purple-100 text-purple-800';
        case 'COMPLETED': return 'bg-gray-100 text-gray-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'OUTSTANDING': return 'bg-red-100 text-red-800';
        case 'PAID': return 'bg-green-100 text-green-800';
        case 'PARTIALLY_PAID': return 'bg-yellow-100 text-yellow-800';
        case 'REFUNDED': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status, type)}`}>
      {status.replace('_', ' ')}
    </span>
  );
}