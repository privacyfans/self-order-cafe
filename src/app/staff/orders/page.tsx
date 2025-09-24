'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { printReceipt } from '@/lib/print';

interface Order {
  id: number;
  order_number: string;
  table_id: number;
  order_status: string;
  payment_status: string;
  total_amount: number;
  submitted_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  status: string;
  special_instructions?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'outstanding' | 'completed'>('outstanding');
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [showTakeawayModal, setShowTakeawayModal] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      // Always fetch all orders for counts
      const allResponse = await fetch('/api/orders');
      
      if (!allResponse.ok) {
        throw new Error(`HTTP error! status: ${allResponse.status}`);
      }
      
      const allData = await allResponse.json();
      const allOrdersData = Array.isArray(allData?.orders) ? allData.orders : [];
      setAllOrders(allOrdersData);

      // Filter orders based on current filter
      let filteredOrders = allOrdersData;
      if (filter === 'outstanding') {
        filteredOrders = allOrdersData.filter((order: Order) => order.payment_status === 'OUTSTANDING');
      } else if (filter === 'completed') {
        filteredOrders = allOrdersData.filter((order: Order) => order.payment_status === 'PAID');
      }

      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setAllOrders([]);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  const fetchMenuData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        fetch('/api/menu/categories'),
        fetch('/api/menu/items')
      ]);
      const categoriesData = await categoriesRes.json();
      const itemsData = await itemsRes.json();
      setCategories(categoriesData.categories || []);
      setMenuItems(itemsData.items || []);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMenuData();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: status })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const markItemAsServed = async (itemId: number) => {
    try {
      const response = await fetch('/api/orders/mark-item-served', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to mark item as served:', error);
    }
  };

  const markAllItemsAsServed = async (orderId: number) => {
    try {
      const response = await fetch('/api/orders/mark-all-served', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to mark all items as served:', error);
    }
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCart(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const submitTakeawayOrder = async () => {
    if (cart.length === 0 || !customerName) return;

    try {
      const orderData = {
        order_type: 'TAKEAWAY',
        customer_name: customerName,
        customer_phone: customerPhone,
        items: cart.map(item => ({
          item_id: item.id,
          quantity: item.quantity,
          unit_price: item.base_price
        }))
      };

      const response = await fetch('/api/orders/takeaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setShowTakeawayModal(false);
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error submitting takeaway order:', error);
    }
  };

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <button
          onClick={() => setShowTakeawayModal(true)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
        >
          <span>📦</span>
          <span>New Takeaway Order</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <div className="flex space-x-1">
          {[
            { key: 'outstanding', label: 'Outstanding Orders', count: Array.isArray(allOrders) ? allOrders.filter(o => o.payment_status === 'OUTSTANDING').length : 0 },
            { key: 'all', label: 'All Orders', count: Array.isArray(allOrders) ? allOrders.length : 0 },
            { key: 'completed', label: 'Completed', count: Array.isArray(allOrders) ? allOrders.filter(o => o.payment_status === 'PAID').length : 0 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'outstanding' | 'completed')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === tab.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                filter === tab.key
                  ? 'bg-indigo-200 text-indigo-800'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match the current filter.</p>
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const hasReadyItems = order.items?.some(item => item.status === 'READY');

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                  hasReadyItems
                    ? 'border-green-500 bg-green-50'
                    : order.payment_status === 'OUTSTANDING'
                      ? 'border-orange-200'
                      : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-indigo-600 font-bold">T{order.table_id}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                        <p className="text-sm text-gray-500">Table {order.table_id} • {formatDate(order.submitted_at)}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <StatusBadge status={order.order_status} type="order" />
                          <StatusBadge status={order.payment_status} type="payment" />
                          {hasReadyItems && (
                            <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                              Items Ready
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          {isExpanded ? 'Hide' : 'Show'} Items ({order.items?.length || 0})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {isExpanded && order.items && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {item.quantity}x {item.item_name}
                                </span>
                                <StatusBadge status={item.status} type="item" />
                              </div>
                              {item.special_instructions && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Note: {item.special_instructions}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                {formatCurrency(item.unit_price || 0)} each • Total: {formatCurrency(item.subtotal || 0)}
                              </p>
                            </div>

                            {item.status === 'READY' && (
                              <button
                                onClick={() => markItemAsServed(item.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                Mark Served
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      {order.order_status !== 'COMPLETED' && (
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="SUBMITTED">Submitted</option>
                          <option value="PREPARING">Preparing</option>
                          <option value="READY">Ready</option>
                          <option value="SERVED">Served</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {hasReadyItems && (
                        <button
                          onClick={() => markAllItemsAsServed(order.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          All Mark Served
                        </button>
                      )}
                      {order.payment_status === 'OUTSTANDING' && (
                        <button
                          onClick={() => window.open(`/staff/payment?orderId=${order.id}`, '_blank')}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Process Payment
                        </button>
                      )}
                      <button
                        onClick={() => printReceipt(order)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                      >
                        Print Receipt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Takeaway Order Modal */}
      {showTakeawayModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">New Takeaway Order</h2>
              <button
                onClick={() => setShowTakeawayModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Menu Items */}
                <div className="lg:col-span-2">
                  <div className="flex space-x-2 mb-4 overflow-x-auto">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === null 
                          ? 'bg-amber-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Items
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          selectedCategory === category.id 
                            ? 'bg-amber-600 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {menuItems
                      .filter(item => selectedCategory === null || item.category_id === selectedCategory)
                      .map(item => (
                        <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-amber-600 text-lg">
                              {formatCurrency(item.base_price)}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Cart & Customer Info */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                    <input
                      type="text"
                      placeholder="Customer Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg mb-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number (Optional)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No items added to cart</p>
                    ) : (
                      <div className="space-y-3">
                        {cart.map(item => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                              <p className="text-xs text-gray-600">{formatCurrency(item.base_price)} each</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 font-bold text-sm flex items-center justify-center"
                              >
                                −
                              </button>
                              <span className="text-sm font-medium text-gray-900 w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 font-bold text-sm flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-gray-300 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total:</span>
                            <span className="font-bold text-xl text-amber-600">
                              {formatCurrency(cart.reduce((sum, item) => sum + (item.base_price * item.quantity), 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={submitTakeawayOrder}
                    disabled={cart.length === 0 || !customerName}
                    className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Takeaway Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, type }: { status: string; type: 'order' | 'payment' | 'item' }) {
  const getStatusColor = (status: string, type: string) => {
    if (type === 'order' || type === 'item') {
      switch (status) {
        case 'SUBMITTED':
        case 'PENDING': return 'bg-blue-100 text-blue-800';
        case 'PREPARING': return 'bg-yellow-100 text-yellow-800';
        case 'READY': return 'bg-green-100 text-green-800';
        case 'SERVED': return 'bg-purple-100 text-purple-800';
        case 'COMPLETED': return 'bg-gray-100 text-gray-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'OUTSTANDING': return 'bg-red-100 text-red-800';
        case 'PAID': return 'bg-green-100 text-green-800';
        case 'PARTIALLY_PAID': return 'bg-yellow-100 text-yellow-800';
        case 'REFUNDED': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status, type)}`}>
      {status.replace('_', ' ')}
    </span>
  );
}