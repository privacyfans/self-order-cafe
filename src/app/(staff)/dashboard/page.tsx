'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Order } from '@/types';

interface DashboardStats {
  totalOutstanding: number;
  totalAmount: number;
  todayOrders: number;
}

export default function StaffDashboard() {
  const [outstandingOrders, setOutstandingOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOutstanding: 0,
    totalAmount: 0,
    todayOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/outstanding');
        const data = await response.json();
        setOutstandingOrders(data.orders || []);
        setStats(data.stats || stats);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [stats]);

  const handlePayment = async (orderId: number) => {
    window.location.href = `/staff/payment/${orderId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Outstanding Orders</h3>
          <p className="text-2xl font-bold text-red-600">{stats.totalOutstanding}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Outstanding Amount</h3>
          <p className="text-2xl font-bold text-red-600">
            Rp {stats.totalAmount.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Today&apos;s Orders</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.todayOrders}</p>
        </div>
      </div>

      {/* Outstanding Orders Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Outstanding Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {outstandingOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Meja {order.table_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.submitted_at).toLocaleTimeString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {order.total_amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.order_status === 'READY' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handlePayment(order.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Process Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {outstandingOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No outstanding orders
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
