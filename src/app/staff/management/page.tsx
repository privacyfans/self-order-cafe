'use client';

import { useEffect, useState } from 'react';

interface Staff {
  id: number;
  employee_id: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  username: string;
  role: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    phone_number: '',
    username: '',
    password: '',
    role: 'CASHIER',
    is_active: true
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      const data = await response.json();
      setStaff(data.staff || []);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff';
      const method = editingStaff ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchStaff();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save staff:', error);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      employee_id: staffMember.employee_id,
      full_name: staffMember.full_name,
      email: staffMember.email || '',
      phone_number: staffMember.phone_number || '',
      username: staffMember.username,
      password: '',
      role: staffMember.role,
      is_active: staffMember.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        const response = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchStaff();
        }
      } catch (error) {
        console.error('Failed to delete staff:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      full_name: '',
      email: '',
      phone_number: '',
      username: '',
      password: '',
      role: 'CASHIER',
      is_active: true
    });
    setEditingStaff(null);
    setShowModal(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Add Staff
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.employee_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingStaff ? 'Edit Staff' : 'Add Staff'}
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                />
                <input
                  type="password"
                  placeholder={editingStaff ? "New Password (leave blank to keep current)" : "Password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  required={!editingStaff}
                />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="KITCHEN">Kitchen</option>
                  <option value="WAITER">Waiter</option>
                </select>
                <label className="flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  Active
                </label>
                <div className="flex space-x-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                  >
                    {editingStaff ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
