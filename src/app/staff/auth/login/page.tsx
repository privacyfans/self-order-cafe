'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth info in localStorage
        localStorage.setItem('staff_auth', JSON.stringify(data.staff));
        router.push('/staff/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDemoLogin = (username: string, password: string) => {
    setFormData({ username, password });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Cafe POS</h1>
          <p className="text-gray-600 mt-2">Staff Dashboard Login</p>
        </div>

        {/* Login Form */}
        <div className="bg-white shadow-xl rounded-2xl p-8">
          {/* Error Toast */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3 font-medium">Demo Login:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin', 'admin123')}
                className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors text-gray-700"
              >
                <strong>Admin:</strong> admin / admin123
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('cashier1', 'cashier123')}
                className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors text-gray-700"
              >
                <strong>Cashier:</strong> cashier1 / cashier123
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('kitchen1', 'kitchen123')}
                className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors text-gray-700"
              >
                <strong>Kitchen:</strong> kitchen1 / kitchen123
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager', 'password123')}
                className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors text-gray-700"
              >
                <strong>Manager:</strong> manager / password123
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('waiter1', 'password123')}
                className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors text-gray-700"
              >
                <strong>Waiter:</strong> waiter1 / password123
              </button>
            </div>
          </div>
        </div>

        {/* Back to Customer */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            ← Back to Customer Menu
          </Link>
        </div>
      </div>
    </div>
  );
}