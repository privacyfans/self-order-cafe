'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';

interface DailySales {
  date: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  payment_methods: {
    cash: number;
    qris: number;
    card: number;
  };
}

interface PopularItem {
  item_name: string;
  total_quantity: number;
  total_revenue: number;
  percentage: number;
}

interface HourlySales {
  hour: number;
  orders: number;
  revenue: number;
}

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySales, setDailySales] = useState<DailySales | null>(null);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySales[]>([]);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports?date=${selectedDate}&range=${dateRange}`);
      const data = await response.json();

      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }

      setDailySales(data.daily);
      setPopularItems(data.popular_items || []);
      setHourlySales(data.hourly || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);



  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/reports/export?date=${selectedDate}&range=${dateRange}&format=${format}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${selectedDate}.${format === 'pdf' ? 'html' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      {/* Header with Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Reports & Analytics</h1>
            <p className="text-gray-500">Comprehensive business performance insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => exportReport('pdf')}
              disabled={isExporting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              📄 {isExporting ? 'Exporting...' : 'Export HTML'}
            </button>
            <button
              onClick={() => exportReport('excel')}
              disabled={isExporting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              📊 {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Date Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' }
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setDateRange(period.key as 'today' | 'week' | 'month' | 'custom')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  dateRange === period.key
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Key Metrics */}
      {dailySales && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Orders"
            value={dailySales.total_orders.toString()}
            icon="📊"
            color="blue"
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(dailySales.total_revenue)}
            icon="💰"
            color="green"
          />
          <MetricCard
            title="Average Order Value"
            value={formatCurrency(dailySales.avg_order_value)}
            icon="📈"
            color="purple"
          />
          <MetricCard
            title="Peak Hour"
            value={`${getBestHour()}:00`}
            icon="⏰"
            color="orange"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Popular Items</h2>
            <p className="text-sm text-gray-500 mt-1">Best selling menu items</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {popularItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                      <p className="text-sm text-gray-500">{item.total_quantity} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.total_revenue)}</p>
                    <p className="text-sm text-gray-500">{item.percentage}% of sales</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        {dailySales && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
              <p className="text-sm text-gray-500 mt-1">Revenue breakdown by payment type</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { method: 'Cash', amount: dailySales.payment_methods.cash, icon: '💵', color: 'green' },
                  { method: 'QRIS', amount: dailySales.payment_methods.qris, icon: '📱', color: 'blue' },
                  { method: 'Card', amount: dailySales.payment_methods.card, icon: '💳', color: 'purple' }
                ].map((payment) => {
                  const percentage = (payment.amount / dailySales.total_revenue) * 100;
                  return (
                    <div key={payment.method}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{payment.icon}</span>
                          <span className="font-medium text-gray-900">{payment.method}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            payment.color === 'green' ? 'bg-green-500' :
                            payment.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hourly Sales Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Hourly Sales Performance</h2>
          <p className="text-sm text-gray-500 mt-1">Orders and revenue by hour</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-12 gap-2">
            {hourlySales.map((hour) => (
              <div key={hour.hour} className="text-center">
                <div
                  className="bg-indigo-600 rounded-t-md mx-auto mb-2 transition-all hover:bg-indigo-700"
                  style={{
                    width: '20px',
                    height: `${Math.max(4, (hour.orders / Math.max(...hourlySales.map(h => h.orders))) * 120)}px`
                  }}
                  title={`${hour.hour}:00 - ${hour.orders} orders, ${formatCurrency(hour.revenue)}`}
                ></div>
                <div className="text-xs text-gray-500 font-medium">{hour.hour}</div>
                <div className="text-xs text-gray-400">{hour.orders}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            Hours (24-hour format) • Blue bars represent order volume
          </div>
        </div>
      </div>
    </div>
  );

  function getBestHour(): number {
    if (!hourlySales.length) return 12;
    const bestHour = hourlySales.reduce((best, current) =>
      current.orders > best.orders ? current : best
    );
    return bestHour.hour;
  }

  function getBestHourOrders(): number {
    if (!hourlySales.length) return 0;
    return Math.max(...hourlySales.map(h => h.orders));
  }
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}