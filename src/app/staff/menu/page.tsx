'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  icon_url?: string;
  is_active: boolean;
}

interface MenuItem {
  id: number;
  category_id: number;
  sku?: string;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_available: boolean;
  is_active: boolean;
  preparation_time: number;
  display_order: number;
  category_name?: string;
}

interface MenuFormData {
  id?: number;
  category_id: number;
  sku: string;
  name: string;
  description: string;
  base_price: number;
  image_url: string;
  is_available: boolean;
  is_active: boolean;
  preparation_time: number;
  display_order: number;
}

export default function MenuManagementPage() {
  const { showToast, ToastContainer } = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [itemFormData, setItemFormData] = useState<MenuFormData>({
    category_id: 0,
    sku: '',
    name: '',
    description: '',
    base_price: 0,
    image_url: '',
    is_available: true,
    is_active: true,
    preparation_time: 10,
    display_order: 0
  });

  const [categoryFormData, setCategoryFormData] = useState({
    id: undefined as number | undefined,
    name: '',
    description: '',
    display_order: 0,
    icon_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu/items');
      const data = await response.json();
      setMenuItems(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        return data.imageUrl;
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      showToast('Failed to upload image. Please try again.', 'error');
      return '';
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = itemFormData.image_url;

    // Upload image if a new file is selected
    if (imageFile) {
      imageUrl = await handleImageUpload(imageFile);
      if (!imageUrl) return; // Stop if upload failed
    }

    const payload = {
      ...itemFormData,
      image_url: imageUrl,
      base_price: Number(itemFormData.base_price),
      preparation_time: Number(itemFormData.preparation_time),
      display_order: Number(itemFormData.display_order)
    };

    try {
      const url = '/api/menu/items';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        await fetchMenuItems();
        setShowItemForm(false);
        setEditingItem(null);
        setImageFile(null);
        resetItemForm();
        showToast(editingItem ? 'Menu item updated successfully!' : 'Menu item created successfully!', 'success');
      } else {
        showToast('Failed to save menu item: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      showToast('Failed to save menu item', 'error');
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/menu/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchCategories();
        setShowCategoryForm(false);
        setEditingCategory(null);
        resetCategoryForm();
        showToast(editingCategory ? 'Category updated successfully!' : 'Category created successfully!', 'success');
      } else {
        showToast('Failed to save category: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Failed to save category', 'error');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await fetch(`/api/menu/items?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchMenuItems();
        showToast('Menu item deleted successfully!', 'success');
      } else {
        showToast('Failed to delete menu item: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showToast('Failed to delete menu item', 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? All items in this category will also be deleted.')) return;

    try {
      const response = await fetch(`/api/menu/categories?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchCategories();
        await fetchMenuItems();
        showToast('Category deleted successfully!', 'success');
      } else {
        showToast('Failed to delete category: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemFormData({
      id: item.id,
      category_id: item.category_id,
      sku: item.sku || '',
      name: item.name,
      description: item.description || '',
      base_price: item.base_price,
      image_url: item.image_url || '',
      is_available: item.is_available,
      is_active: item.is_active,
      preparation_time: item.preparation_time || 10,
      display_order: item.display_order || 0
    });
    setShowItemForm(true);
  };

  const startEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      id: category.id,
      name: category.name,
      description: category.description || '',
      display_order: category.display_order || 0,
      icon_url: category.icon_url || '',
      is_active: category.is_active
    });
    setShowCategoryForm(true);
  };

  const resetItemForm = () => {
    setItemFormData({
      category_id: 0,
      sku: '',
      name: '',
      description: '',
      base_price: 0,
      image_url: '',
      is_available: true,
      is_active: true,
      preparation_time: 10,
      display_order: 0
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      id: undefined,
      name: '',
      description: '',
      display_order: 0,
      icon_url: '',
      is_active: true
    });
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-700">Manage menu categories and items</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setEditingCategory(null);
                resetCategoryForm();
                setShowCategoryForm(true);
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              + Add Category
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                resetItemForm();
                setShowItemForm(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Add Menu Item
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditCategory(category)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-800 mb-2">{category.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-700">
                  <span>Order: {category.display_order}</span>
                  <span className={category.is_active ? 'text-green-600' : 'text-red-600'}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Menu Items ({filteredItems.length})</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Image */}
                <div className="h-48 bg-gray-100 relative">
                  {item.image_url ? (
                    <Image width={200} height={200}
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {!item.is_available && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">Unavailable</span>
                    )}
                    {!item.is_active && (
                      <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">Inactive</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-lg font-bold text-indigo-600">{formatCurrency(item.base_price)}</span>
                  </div>
                  <p className="text-sm text-gray-800 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-700 mb-3">
                    <span>SKU: {item.sku || 'N/A'}</span>
                    <span>{item.preparation_time} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">
                      {categories.find(c => c.id === item.category_id)?.name}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditItem(item)}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
              <p className="text-gray-700">Add your first menu item to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Item Form Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <form onSubmit={handleSubmitItem}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
                    <select
                      value={itemFormData.category_id}
                      onChange={(e) => setItemFormData(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      required
                    >
                      <option value={0}>Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">SKU</label>
                    <input
                      type="text"
                      value={itemFormData.sku}
                      onChange={(e) => setItemFormData(prev => ({ ...prev, sku: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      placeholder="Enter SKU (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="Enter menu item name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="Enter item description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Base Price (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={itemFormData.base_price}
                      onChange={(e) => setItemFormData(prev => ({ ...prev, base_price: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Prep Time (min)</label>
                    <input
                      type="number"
                      min="1"
                      value={itemFormData.preparation_time || 10}
                      onChange={(e) => setItemFormData(prev => ({ ...prev, preparation_time: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Display Order</label>
                    <input
                      type="number"
                      min="0"
                      value={itemFormData.display_order || 0}
                      onChange={(e) => setItemFormData(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                  {itemFormData.image_url && (
                    <div className="mt-2">
                      <Image width={200} height={200}
                        src={itemFormData.image_url}
                        alt="Current image"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={itemFormData.is_available}
                      onChange={(e) => setItemFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">Available</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={itemFormData.is_active}
                      onChange={(e) => setItemFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">Active</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemForm(false);
                    setEditingItem(null);
                    setImageFile(null);
                  }}
                  className="px-4 py-2 text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? 'Uploading...' : editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <form onSubmit={handleSubmitCategory}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="Enter category description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={categoryFormData.display_order || 0}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Icon URL</label>
                  <input
                    type="url"
                    value={categoryFormData.icon_url}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, icon_url: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="https://example.com/icon.png"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={categoryFormData.is_active}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">Active</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}