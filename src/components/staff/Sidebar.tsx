'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Staff {
  id: number;
  employee_id: string;
  full_name: string;
  username: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN' | 'WAITER';
  is_active: boolean;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/staff/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
      </svg>
    ),
    roles: ['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN', 'WAITER']
  },
  {
    title: 'Orders',
    href: '/staff/orders',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    roles: ['ADMIN', 'MANAGER', 'CASHIER', 'WAITER']
  },
  {
    title: 'Payment',
    href: '/staff/payment',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    roles: ['ADMIN', 'MANAGER', 'CASHIER']
  },
  {
    title: 'Kitchen',
    href: '/staff/kitchen',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    roles: ['ADMIN', 'MANAGER', 'KITCHEN']
  },
  {
    title: 'Menu Management',
    href: '/staff/menu',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    roles: ['ADMIN', 'MANAGER']
  },
  {
    title: 'Reports',
    href: '/staff/reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    roles: ['ADMIN', 'MANAGER']
  },
  {
    title: 'Tables',
    href: '/staff/tables',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    roles: ['ADMIN', 'MANAGER', 'WAITER']
  },
  {
    title: 'Staff Management',
    href: '/staff/management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    roles: ['ADMIN', 'MANAGER']
  }
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);

  useEffect(() => {
    const staffData = localStorage.getItem('staff_auth');
    if (staffData) {
      setStaff(JSON.parse(staffData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('staff_auth');
    router.push('/staff/auth/login');
  };

  const filteredNavItems = navigationItems.filter(item =>
    staff && item.roles.includes(staff.role)
  );

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-40",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-gray-900">Cafe POS</h1>
              <p className="text-xs text-gray-500">Staff Dashboard</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* User Info */}
      {staff && (
        <div className={cn("p-4 border-b border-gray-200", isCollapsed && "px-2")}>
          <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-medium text-sm">
                {staff.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{staff.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{staff.role}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group relative",
                isActive
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                isCollapsed && "justify-center px-2"
              )}
            >
              <span className={cn(
                "flex-shrink-0",
                isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
              )}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-medium">{item.title}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.title}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full group relative",
            isCollapsed && "justify-center px-2"
          )}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="font-medium">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
}