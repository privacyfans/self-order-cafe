'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';

interface KitchenOrder {
  id: number;
  order_number: string;
  table_id: number;
  submitted_at: string;
  special_instructions?: string;
  items: KitchenOrderItem[];
}

interface KitchenOrderItem {
  id: number;
  item_name: string;
  quantity: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
  special_instructions?: string;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

  useEffect(() => {
    fetchKitchenOrders();

    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(() => {
      fetchKitchenOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchKitchenOrders = async () => {
    try {
      const response = await fetch('/api/kitchen/orders');
      const data = await response.json();
      setOrders(data.orders || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch kitchen orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemStatus = async (itemId: number, status: string) => {
    try {
      const response = await fetch('/api/kitchen/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status })
      });

      if (response.ok) {
        fetchKitchenOrders();
      }
    } catch (error) {
      console.error('Failed to update item status:', error);
    }
  };

  const getOrderPriority = (submittedAt: string) => {
    const orderTime = new Date(submittedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));

    if (diffMinutes > 20) return 'urgent';
    if (diffMinutes > 10) return 'high';
    return 'normal';
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'pending') {
      return order.items.some(item => item.status === 'PENDING');
    }
    if (filter === 'preparing') {
      return order.items.some(item => item.status === 'PREPARING');
    }
    return order.items.some(item => ['PENDING', 'PREPARING'].includes(item.status));
  });

  const getOrderElapsedTime = (submittedAt: string) => {
    const orderTime = new Date(submittedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    return diffMinutes;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kitchen Display</h1>
            <p className="text-gray-500">Real-time order queue for kitchen staff</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString('id-ID')}
            </div>
            <button
              onClick={fetchKitchenOrders}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All Orders', count: filteredOrders.length },
            { key: 'pending', label: 'Pending', count: orders.filter(o => o.items.some(i => i.status === 'PENDING')).length },
            { key: 'preparing', label: 'Preparing', count: orders.filter(o => o.items.some(i => i.status === 'PREPARING')).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'pending' | 'preparing' | 'ready')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                filter === tab.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Kitchen Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500">No orders in the kitchen queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => {
            const priority = getOrderPriority(order.submitted_at);
            const elapsedMinutes = getOrderElapsedTime(order.submitted_at);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                  priority === 'urgent'
                    ? 'border-red-500 bg-red-50'
                    : priority === 'high'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                }`}
              >
                <div className="p-4">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">T{order.table_id}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{order.order_number}</h3>
                        <p className="text-xs text-gray-500">{formatDate(order.submitted_at)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                        priority === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {elapsedMinutes}m ago
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.filter(item => ['PENDING', 'PREPARING'].includes(item.status)).map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {item.quantity}x {item.item_name}
                            </h4>
                            {item.special_instructions && (
                              <p className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded">
                                📝 {item.special_instructions}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={item.status} />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-3">
                          {item.status === 'PENDING' && (
                            <button
                              onClick={() => updateItemStatus(item.id, 'PREPARING')}
                              className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-yellow-700 transition-colors"
                            >
                              🔥 Start Cooking
                            </button>
                          )}
                          {item.status === 'PREPARING' && (
                            <button
                              onClick={() => updateItemStatus(item.id, 'READY')}
                              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-green-700 transition-colors"
                            >
                              ✅ Mark Ready
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Special Instructions */}
                  {order.special_instructions && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Order Note:</strong> {order.special_instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kitchen Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600 text-sm">📋</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Items</p>
              <p className="text-lg font-bold text-gray-900">
                {orders.reduce((sum, order) =>
                  sum + order.items.filter(item => item.status === 'PENDING').length, 0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-yellow-600 text-sm">🔥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Preparing</p>
              <p className="text-lg font-bold text-gray-900">
                {orders.reduce((sum, order) =>
                  sum + order.items.filter(item => item.status === 'PREPARING').length, 0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-green-600 text-sm">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ready</p>
              <p className="text-lg font-bold text-gray-900">
                {orders.reduce((sum, order) =>
                  sum + order.items.filter(item => item.status === 'READY').length, 0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-red-600 text-sm">⚡</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Urgent Orders</p>
              <p className="text-lg font-bold text-gray-900">
                {orders.filter(order => getOrderPriority(order.submitted_at) === 'urgent').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'SERVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '📋';
      case 'PREPARING': return '🔥';
      case 'READY': return '✅';
      case 'SERVED': return '🍽️';
      default: return '❓';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
      <span className="mr-1">{getStatusIcon(status)}</span>
      {status}
    </span>
  );
}