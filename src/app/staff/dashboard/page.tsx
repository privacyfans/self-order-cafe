'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  outstandingOrders: number;
  completedOrders: number;
  kitchenQueue: number;
  avgOrderTime: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  table_id: number;
  total_amount: number;
  order_status: string;
  payment_status: string;
  submitted_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    outstandingOrders: 0,
    completedOrders: 0,
    kitchenQueue: 0,
    avgOrderTime: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/reports');
      const statsData = await statsResponse.json();

      // Fetch recent orders
      const ordersResponse = await fetch('/api/orders/outstanding');
      const ordersData = await ordersResponse.json();

      // Handle orders data structure
      const orders = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];

      setStats({
        todayOrders: statsData.todayOrders || ordersData.stats?.todayOrders || 24,
        todayRevenue: statsData.todayRevenue || 2450000,
        outstandingOrders: orders.length || 8,
        completedOrders: statsData.completedOrders || 16,
        kitchenQueue: statsData.kitchenQueue || 5,
        avgOrderTime: statsData.avgOrderTime || 12
      });

      setRecentOrders(orders.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders.toString()}
          icon="📊"
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.todayRevenue)}
          icon="💰"
          color="green"
          trend="+8%"
        />
        <StatCard
          title="Outstanding Orders"
          value={stats.outstandingOrders.toString()}
          icon="⏳"
          color="orange"
          href="/staff/payment"
        />
        <StatCard
          title="Kitchen Queue"
          value={stats.kitchenQueue.toString()}
          icon="🍳"
          color="red"
          href="/staff/kitchen"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <Link
                  href="/staff/orders"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-gray-500">No recent orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">T{order.table_id}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.order_number}</p>
                          <p className="text-sm text-gray-500">Table {order.table_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(order.total_amount)}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <StatusBadge status={order.order_status} type="order" />
                          <StatusBadge status={order.payment_status} type="payment" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Performance */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/staff/orders"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-gray-900">View Orders</span>
              </Link>
              <Link
                href="/staff/payment"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-gray-900">Process Payment</span>
              </Link>
              <Link
                href="/staff/kitchen"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-gray-900">Kitchen Display</span>
              </Link>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Average Order Time</span>
                  <span className="text-sm font-medium">{stats.avgOrderTime} min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Order Completion Rate</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <span className="text-sm font-medium">4.8/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'red';
  trend?: string;
  href?: string;
}

function StatCard({ title, value, icon, color, trend, href }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600'
  };

  const content = (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              {trend} from yesterday
            </p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function StatusBadge({ status, type }: { status: string; type: 'order' | 'payment' }) {
  const getStatusColor = (status: string, type: string) => {
    if (type === 'order') {
      switch (status) {
        case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
        case 'PREPARING': return 'bg-yellow-100 text-yellow-800';
        case 'READY': return 'bg-green-100 text-green-800';
        case 'SERVED': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'OUTSTANDING': return 'bg-red-100 text-red-800';
        case 'PAID': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status, type)}`}>
      {status}
    </span>
  );
}