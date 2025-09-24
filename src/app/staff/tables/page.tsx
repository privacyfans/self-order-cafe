'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from '@/components/ui/Toast';
import QRCode from 'qrcode';

interface Table {
  id: number;
  table_number: string;
  qr_code: string;
  capacity: number;
  location_zone?: string;
  is_active: boolean;
  is_occupied: boolean;
  outstanding_amount: number;
  order_count: number;
  created_at: string;
  updated_at: string;
}

interface TableFormData {
  id?: number;
  table_number: string;
  capacity: number;
  location_zone: string;
  is_active: boolean;
}

export default function TableManagementPage() {
  const { showToast, ToastContainer } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const [formData, setFormData] = useState<TableFormData>({
    table_number: '',
    capacity: 4,
    location_zone: '',
    is_active: true
  });

  const fetchTables = useCallback(async () => {
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      showToast('Failed to fetch tables', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/tables';
      const method = editingTable ? 'PUT' : 'POST';
      const payload = editingTable ? { ...formData, id: editingTable.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTables();
        setShowForm(false);
        setEditingTable(null);
        resetForm();
        showToast(editingTable ? 'Table updated successfully!' : 'Table created successfully!', 'success');
      } else {
        showToast('Failed to save table: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error saving table:', error);
      showToast('Failed to save table', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      const response = await fetch(`/api/tables?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchTables();
        showToast('Table deleted successfully!', 'success');
      } else {
        showToast('Failed to delete table: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      showToast('Failed to delete table', 'error');
    }
  };

  const generateQrCode = async (table: Table) => {
    try {
      const dataUrl = await QRCode.toDataURL(table.qr_code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
      setSelectedTable(table);
      setShowQrModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      showToast('Failed to generate QR code', 'error');
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeDataUrl || !selectedTable) return;

    const link = document.createElement('a');
    link.download = `table-${selectedTable.table_number}-qr.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const printQrCode = () => {
    if (!qrCodeDataUrl || !selectedTable) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Table ${selectedTable.table_number} QR Code</title>
            <style>
              body { text-align: center; font-family: Arial, sans-serif; padding: 20px; }
              .qr-container { margin: 20px auto; }
              h1 { margin-bottom: 10px; }
              p { margin: 5px 0; color: #666; }
            </style>
          </head>
          <body>
            <h1>Table ${selectedTable.table_number}</h1>
            <p>Scan to view digital menu</p>
            <div class="qr-container">
              <Image width={200} height={200} src="${qrCodeDataUrl}" alt="QR Code" />
            </div>
            <p>Capacity: ${selectedTable.capacity} persons</p>
            ${selectedTable.location_zone ? `<p>Zone: ${selectedTable.location_zone}</p>` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const startEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      table_number: table.table_number,
      capacity: table.capacity,
      location_zone: table.location_zone || '',
      is_active: table.is_active
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      table_number: '',
      capacity: 4,
      location_zone: '',
      is_active: true
    });
  };

  const toggleTableStatus = async (table: Table, field: 'is_active' | 'is_occupied') => {
    try {
      const payload = {
        ...table,
        [field]: !table[field]
      };

      const response = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTables();
        showToast(`Table ${field === 'is_active' ? 'activation' : 'occupation'} status updated!`, 'success');
      } else {
        showToast('Failed to update table status: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error updating table status:', error);
      showToast('Failed to update table status', 'error');
    }
  };

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.table_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (table.location_zone || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = filterZone === 'all' || table.location_zone === filterZone;
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && table.is_active) ||
                         (filterStatus === 'inactive' && !table.is_active) ||
                         (filterStatus === 'occupied' && table.is_occupied) ||
                         (filterStatus === 'available' && !table.is_occupied);

    return matchesSearch && matchesZone && matchesStatus;
  });

  const zones = [...new Set(tables.map(t => t.location_zone).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-700">Manage restaurant tables and QR codes</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingTable(null);
              setShowForm(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add New Table
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value="all">All Zones</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="occupied">Occupied</option>
              <option value="available">Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map((table) => (
          <div key={table.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Table {table.table_number}</h3>
                <p className="text-sm text-gray-600">Capacity: {table.capacity} persons</p>
                {table.location_zone && (
                  <p className="text-sm text-gray-600">Zone: {table.location_zone}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => generateQrCode(table)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Generate QR Code"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
                <button
                  onClick={() => startEdit(table)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit Table"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Table"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                table.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {table.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                table.is_occupied
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {table.is_occupied ? 'Occupied' : 'Available'}
              </span>
            </div>

            {/* Outstanding Orders Info */}
            {table.order_count > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {table.order_count} outstanding order{table.order_count > 1 ? 's' : ''}
                </p>
                <p className="text-sm font-medium text-yellow-900">
                  Total: Rp {Number(table.outstanding_amount).toLocaleString()}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => toggleTableStatus(table, 'is_occupied')}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors ${
                  table.is_occupied
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Mark {table.is_occupied ? 'Available' : 'Occupied'}
              </button>
              <button
                onClick={() => toggleTableStatus(table, 'is_active')}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors ${
                  table.is_active
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {table.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTables.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tables found</h3>
          <p className="text-gray-700">Add your first table to get started.</p>
        </div>
      )}

      {/* Table Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Table Number</label>
                <input
                  type="text"
                  value={formData.table_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, table_number: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  placeholder="Enter table number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  placeholder="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Location Zone</label>
                <input
                  type="text"
                  value={formData.location_zone}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_zone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Indoor, Outdoor, VIP"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-900">Active</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTable(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingTable ? 'Update Table' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && selectedTable && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Table {selectedTable.table_number} QR Code
              </h2>
            </div>

            <div className="p-6 text-center">
              <div className="mb-4">
                <Image width={200} height={200} src={qrCodeDataUrl} alt="QR Code" className="mx-auto border rounded-lg" />
              </div>

              <p className="text-sm text-gray-600 mb-2">
                Scan to access digital menu
              </p>
              <p className="text-xs text-gray-500 mb-6 break-all">
                {selectedTable.qr_code}
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={downloadQrCode}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={printQrCode}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Print
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}