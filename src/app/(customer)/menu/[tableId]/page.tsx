'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { MenuItem, MenuCategory, Order, OrderItem } from '@/types';

interface OrderSummaryData {
  orderNumber: string;
  items: {
    item_id: number;
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    special_instructions: string | null;
  }[];
  total: number;
  isNewOrder?: boolean;
}

interface OrderWithItems extends Order {
  items?: OrderItem[];
}
import { useCartStore } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

export default function MenuPage() {
  const params = useParams();
  const tableId = params.tableId as string;
  
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderSummaryData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string, name: string} | null>(null);
  const [showOrderSummaryQuick, setShowOrderSummaryQuick] = useState(false);
  const categoryRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
  
  const { addItem, getItemCount, getTotal, setTableId } = useCartStore();
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    setTableId(tableId);
    fetchCategories();
    fetchItems();
  }, [tableId, setTableId]);

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      if (selectedCategory !== null) return; // Only work when "All Items" is selected
      
      const scrollPosition = window.scrollY + 200; // Offset for header
      let activeCategory: number | null = null;
      
      categories.forEach(category => {
        const element = categoryRefs.current[category.id];
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          if (scrollPosition >= elementTop) {
            activeCategory = category.id;
          }
        }
      });
      
      // Update visual indicator without changing selectedCategory
      // This keeps "All Items" selected while highlighting current section
      categories.forEach(category => {
        const button = document.querySelector(`[data-category-id="${category.id}"]`);
        if (button) {
          if (category.id === activeCategory) {
            button.classList.add('bg-gradient-to-r', 'from-amber-600', 'to-amber-700', 'text-white', 'shadow-lg');
            button.classList.remove('bg-gray-100', 'text-gray-700');
          } else {
            button.classList.remove('bg-gradient-to-r', 'from-amber-600', 'to-amber-700', 'text-white', 'shadow-lg');
            button.classList.add('bg-gray-100', 'text-gray-700');
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories');
      const data = await response.json();
      setCategories(data.categories || data || []);
      if ((data.categories || data)?.length > 0) {
        setSelectedCategory((data.categories || data)[0].id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/menu/items');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSuccess = (orderData: OrderSummaryData) => {
    setLastOrder(orderData);
    setShowOrderSummary(true);
    success('Order berhasil dikirim!');
  };

  const handleAddMoreOrder = () => {
    setShowOrderSummary(false);
  };

  const handleFinishOrdering = () => {
    setShowOrderSummary(false);
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      item_id: item.id,
      name: item.name,
      quantity: 1,
      unit_price: item.base_price,
      modifiers: []
    });
    success(`${item.name} ditambahkan ke keranjang`);
  };

  const handleImageClick = (imageUrl: string, itemName: string) => {
    setSelectedImage({ url: imageUrl, name: itemName });
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true;
    const matchesSearch = searchQuery ? 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesCategory && matchesSearch;
  });

  // Group items by category when "All Items" is selected
  const groupedItems = selectedCategory === null ? 
    categories.map(category => ({
      category,
      items: filteredItems.filter(item => item.category_id === category.id)
    })).filter(group => group.items.length > 0) :
    [{ category: null, items: filteredItems }];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Menu</h2>
          <p className="text-gray-600">Please wait while we prepare your digital menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .category-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Modern Header */}
      <div className="bg-white shadow-lg border-b-4 border-amber-600">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Menu</h1>
            <div className="flex items-center justify-center space-x-2">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Table {tableId}
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Ready to Order</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Categories & Search */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search for your favorite dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-amber-200 rounded-2xl text-amber-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-amber-50 focus:bg-white"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Categories with All option */}
          <div className="flex gap-2 overflow-x-auto category-scroll pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {categories && categories.length > 0 && categories.map((category) => (
              <button
                key={category.id}
                data-category-id={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Menu Items */}
      <div className="container mx-auto px-4 py-6">
        {groupedItems.map((group) => (
          <div key={group.category?.id || 'all'}>
            {/* Category Header for All Items view */}
            {selectedCategory === null && group.category && (
              <div 
                ref={(el) => { categoryRefs.current[group.category!.id] = el; }}
                className="mb-6"
              >
                <h2 className="text-2xl font-bold text-amber-800 mb-4 sticky top-32 bg-gradient-to-r from-amber-50 to-amber-100 py-2 px-4 rounded-lg shadow-sm">
                  {group.category.name}
                </h2>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {group.items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1">
              {/* Image Section */}
              <div className="relative h-32 overflow-hidden">
                {item.image_url && item.image_url.trim() !== '' ? (
                  <div
                    onClick={() => handleImageClick(item.image_url!, item.name)}
                    className="relative w-full h-full cursor-pointer group/image"
                  >
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder-food.svg';
                      }}
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/30 transition-all duration-300 flex items-center justify-center pointer-events-none">
                      <div className="transform scale-0 group-hover/image:scale-100 transition-transform duration-300">
                        <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Availability Badge */}
                {!item.is_available && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Sold Out
                    </span>
                  </div>
                )}

                {/* Preparation Time Badge */}
                {item.preparation_time && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {item.preparation_time} min
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-3">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-amber-600">
                    {formatCurrency(item.base_price)}
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.is_available}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      item.is_available
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 hover:scale-105 shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {item.is_available ? (
                      <div className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add</span>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </button>
                </div>
              </div>
            </div>
              ))}
            </div>
          </div>
        ))}

        {/* Enhanced Empty State */}
        {filteredItems.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No dishes found</h3>
            <p className="text-gray-600 mb-6">Try changing your search or category filter to find what you&apos;re looking for.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              Show All Items
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-3">
        {/* Order Summary Button */}
        <button
          onClick={() => setShowOrderSummaryQuick(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-full shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-110 border-2 border-white"
          title="View Order Summary"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </button>

        {/* Cart Button - Only show when items exist */}
        {getItemCount() > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-105 border-2 border-white"
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 8m2-8l8 0m0 0l2 8M13 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {getItemCount()}
              </div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium">Cart</span>
              <span className="text-xs opacity-90">{formatCurrency(getTotal())}</span>
            </div>
          </button>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <CartModal 
          onClose={() => setShowCart(false)} 
          onError={error}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Order Summary Screen */}
      {showOrderSummary && lastOrder && (
        <OrderSummaryScreen
          orderNumber={lastOrder.orderNumber}
          orderItems={lastOrder.items}
          total={lastOrder.total}
          onAddMore={handleAddMoreOrder}
          onClose={handleFinishOrdering}
          isNewOrder={lastOrder.isNewOrder}
        />
      )}

      {/* Order Summary Quick View Modal */}
      {showOrderSummaryQuick && (
        <OrderSummaryModal
          tableId={tableId}
          onClose={() => setShowOrderSummaryQuick(false)}
        />
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          itemName={selectedImage.name}
          onClose={closeImageModal}
        />
      )}

      {/* Toast Container */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function CartModal({ onClose, onError, onOrderSuccess }: { 
  onClose: () => void;
  onError: (message: string) => void;
  onOrderSuccess: (orderData: OrderSummaryData) => void;
}) {
  const { items, updateQuantity, removeItem, getTotal, clearCart, updateItemInstructions } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItemExpansion = (itemId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        item_id: item.item_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
        special_instructions: item.special_instructions || null
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: useCartStore.getState().tableId,
          items: orderItems
        })
      });

      const result = await response.json();
      if (result.success) {
        const orderData = {
          orderNumber: result.orderNumber,
          items: orderItems,
          total: getTotal(),
          isNewOrder: result.isNewOrder
        };
        
        clearCart();
        onClose();
        onOrderSuccess(orderData);
      } else {
        onError('Gagal mengirim order: ' + result.error);
      }
    } catch {
      onError('Gagal mengirim order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="bg-white w-full max-h-[85vh] rounded-t-3xl flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 8m2-8l8 0m0 0l2 8M13 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.map((item, index) => {
            const isExpanded = expandedItems.has(item.item_id);
            return (
              <div key={index} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{formatCurrency(item.unit_price)} each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                        className="w-10 h-10 rounded-l-xl bg-red-500 text-white flex items-center justify-center font-bold hover:bg-red-600 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-base font-bold text-gray-900 bg-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                        className="w-10 h-10 rounded-r-xl bg-green-500 text-white flex items-center justify-center font-bold hover:bg-green-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.item_id)}
                      className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => toggleItemExpansion(item.item_id)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mb-2"
                >
                  {isExpanded ? '▼ Hide Instructions' : '▶ Add Special Instructions'}
                </button>

                {isExpanded && (
                  <div className="mt-2">
                    <textarea
                      placeholder="Contoh: Tidak pedas, extra sambal, dll..."
                      value={item.special_instructions || ''}
                      onChange={(e) => updateItemInstructions(item.item_id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 resize-none"
                      rows={2}
                    />
                  </div>
                )}

                <div className="text-right mt-2">
                  <span className="font-bold text-gray-900">
                    Rp {(item.quantity * item.unit_price).toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0 rounded-b-3xl">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Order Total:</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(getTotal())}</span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
              <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
              <span>Table {useCartStore.getState().tableId}</span>
            </div>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={submitting || items.length === 0}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 hover:from-green-700 hover:to-green-800 transition-all duration-200 hover:scale-105 shadow-lg disabled:hover:scale-100"
          >
            {submitting ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending Order...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Send Order</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderSummaryScreen({ 
  orderNumber, 
  orderItems, 
  total, 
  onAddMore, 
  onClose,
  isNewOrder = true
}: { 
  orderNumber: string;
  orderItems: {
    item_id: number;
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    special_instructions: string | null;
  }[];
  total: number;
  onAddMore: () => void;
  onClose: () => void;
  isNewOrder?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl">
        <div className="p-8 text-center border-b border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {isNewOrder ? 'Order Sent Successfully!' : 'Items Added Successfully!'}
          </h2>
          <div className="bg-blue-50 rounded-2xl p-3 inline-block">
            <p className="text-sm font-medium text-blue-800">Order: <span className="font-bold">{orderNumber}</span></p>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            {isNewOrder ? 'Pesanan Anda:' : 'Item yang Ditambahkan:'}
          </h3>
          <div className="space-y-2 mb-4">
            {orderItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <span className="font-medium text-gray-900">{item.quantity}x {item.name}</span>
                  {item.special_instructions && (
                    <p className="text-xs text-gray-500 mt-1">Note: {item.special_instructions}</p>
                  )}
                </div>
                <span className="font-semibold text-gray-900">
                  Rp {item.subtotal.toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
            <span className="text-lg font-bold text-gray-900">
              {isNewOrder ? 'Total:' : 'Subtotal Item Baru:'}
            </span>
            <span className="text-lg font-bold text-green-600">
              Rp {total.toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
          <div className="flex gap-3 mb-4">
            <button
              onClick={onAddMore}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add More</span>
              </div>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-2xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Done</span>
              </div>
            </button>
          </div>
          <div className="bg-white rounded-2xl p-3">
            <p className="text-xs text-gray-600 text-center">
              {isNewOrder
                ? '🍳 Your order is being prepared in the kitchen'
                : '✅ Items added to your existing order'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageModal({ imageUrl, itemName, onClose }: {
  imageUrl: string;
  itemName: string;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
          aria-label="Close image"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative bg-gray-50 min-h-[300px] flex items-center justify-center">
            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">Loading image...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="flex flex-col items-center space-y-3 text-gray-500">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Image not available</span>
                </div>
              </div>
            )}

            {/* Actual Image */}
            <Image
              src={imageUrl}
              alt={itemName}
              width={800}
              height={600}
              className={`w-full h-auto max-h-[70vh] object-contain mx-auto block transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>

          {/* Image Info */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">{itemName}</h3>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span>Tap outside or press ESC to close</span>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Full size view</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close modal"
      />
    </div>
  );
}

// Order Summary Modal Component
function OrderSummaryModal({ tableId, onClose }: { tableId: string; onClose: () => void }) {
  const [latestOrder, setLatestOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders?tableId=${tableId}`);
      const data = await response.json();
      const orders = data.orders || [];
      
      // Find the latest unpaid order for THIS table only
      const unpaidOrder = orders
        .filter((order: OrderWithItems) => {
          return order.table_id == parseInt(tableId) && order.payment_status !== 'PAID';
        })
        .sort((a: OrderWithItems, b: OrderWithItems) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0];
      
      setLatestOrder(unpaidOrder || null);
    } catch (error) {
      console.error('Error fetching latest order:', error);
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    fetchLatestOrder();
  }, [fetchLatestOrder]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Current Order</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-white hover:shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-700 mt-1 font-medium">Table {tableId}</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : !latestOrder ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600 font-medium">No pending orders</p>
              <p className="text-sm text-gray-500 mt-1">All orders have been completed</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Order #{latestOrder.id}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  latestOrder.order_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  latestOrder.order_status === 'PREPARING' ? 'bg-yellow-100 text-yellow-800' :
                  latestOrder.order_status === 'SERVED' ? 'bg-blue-100 text-blue-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {latestOrder.order_status || 'PENDING'}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                {latestOrder.items?.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        {item.quantity}x {item.item_name}
                      </span>
                      {item.special_instructions && (
                        <p className="text-sm text-gray-600 mt-1">{item.special_instructions}</p>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900 ml-4">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(latestOrder.total_amount || 0)}
                  </span>
                </div>
                {latestOrder.submitted_at && (
                  <p className="text-sm text-gray-500 mt-2">
                    Ordered: {new Date(latestOrder.submitted_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close modal"
      />
    </div>
  );
}
