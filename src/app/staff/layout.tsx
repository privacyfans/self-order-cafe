'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/staff/Sidebar';
import { cn, formatCurrency } from '@/lib/utils';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({ orders: 0, revenue: 0 });
  const [pendingOrders, setPendingOrders] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const staffData = localStorage.getItem('staff_auth');

      if (!staffData && pathname !== '/staff/auth/login') {
        router.push('/staff/auth/login');
        return;
      }

      if (staffData && pathname === '/staff/auth/login') {
        router.push('/staff/dashboard');
        return;
      }

      setIsAuthenticated(!!staffData);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayStats();
      fetchPendingOrders();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchTodayStats();
        fetchPendingOrders();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/reports?date=${today}`);
      const data = await response.json();
      
      if (data.daily) {
        setTodayStats({
          orders: data.daily.total_orders,
          revenue: data.daily.total_revenue
        });
      }
    } catch (error) {
      console.error('Failed to fetch today stats:', error);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('/api/kitchen/orders');
      const data = await response.json();
      const orders = data.orders || [];
      
      const pending = orders.filter((order: any) =>
        order.items.some((item: any) => ['PENDING', 'PREPARING'].includes(item.status))
      ).length;
      
      setPendingOrders(pending);
    } catch (error) {
      console.error('Failed to fetch pending orders:', error);
    }
  };

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Auth pages don't need sidebar
  if (pathname === '/staff/auth/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />

      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {getPageTitle(pathname)}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {getPageDescription(pathname)}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button 
                onClick={() => router.push('/staff/kitchen')}
                className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Image src="/notification-bell.svg" alt="Notifications" width={24} height={24} />
                {pendingOrders > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingOrders > 9 ? '9+' : pendingOrders}
                  </span>
                )}
              </button>

              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="text-gray-500">Today&apos;s Orders</p>
                  <p className="font-semibold text-gray-900">{todayStats.orders}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Revenue</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(todayStats.revenue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/staff/dashboard': 'Dashboard',
    '/staff/orders': 'Orders Management',
    '/staff/payment': 'Payment Processing',
    '/staff/kitchen': 'Kitchen Display',
    '/staff/menu': 'Menu Management',
    '/staff/reports': 'Reports & Analytics',
    '/staff/tables': 'Table Management',
    '/staff/management': 'Staff Management'
  };

  return titles[pathname] || 'Staff Dashboard';
}

function getPageDescription(pathname: string): string {
  const descriptions: Record<string, string> = {
    '/staff/dashboard': 'Overview of restaurant operations and key metrics',
    '/staff/orders': 'View and manage customer orders',
    '/staff/payment': 'Process payments and manage outstanding bills',
    '/staff/kitchen': 'Kitchen order queue and preparation status',
    '/staff/menu': 'Manage menu items, categories, and pricing',
    '/staff/reports': 'Sales reports and business analytics',
    '/staff/tables': 'Manage table status and QR codes',
    '/staff/management': 'Manage staff accounts and permissions'
  };

  return descriptions[pathname] || 'Manage your restaurant operations';
}