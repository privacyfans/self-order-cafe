import { create } from 'zustand';
import { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  tableId: string;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  updateItemInstructions: (itemId: number, instructions: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  setTableId: (tableId: string) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  tableId: '',
  
  addItem: (item) => set((state) => {
    const existingItemIndex = state.items.findIndex(
      existing => existing.item_id === item.item_id && 
      existing.size_id === item.size_id &&
      JSON.stringify(existing.modifiers) === JSON.stringify(item.modifiers)
    );
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...state.items];
      updatedItems[existingItemIndex].quantity += item.quantity;
      return { items: updatedItems };
    }
    
    return { items: [...state.items, item] };
  }),
  
  removeItem: (itemId: number) => set((state) => ({
    items: state.items.filter(item => item.item_id !== itemId)
  })),
  
  updateQuantity: (itemId: number, quantity: number) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(item => item.item_id !== itemId) };
    }
    
    const updatedItems = state.items.map(item => 
      item.item_id === itemId ? { ...item, quantity } : item
    );
    return { items: updatedItems };
  }),

  updateItemInstructions: (itemId: number, instructions: string) => set((state) => {
    const updatedItems = state.items.map(item => 
      item.item_id === itemId ? { ...item, special_instructions: instructions } : item
    );
    return { items: updatedItems };
  }),
  
  clearCart: () => set({ items: [] }),
  
  setTableId: (tableId) => set({ tableId }),
  
  getTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      const modifierTotal = item.modifiers.reduce(
        (sum, mod) => sum + (mod.price_adjustment * mod.quantity), 0
      );
      const itemPrice = item.unit_price + (item.price_adjustment || 0) + modifierTotal;
      return total + (itemPrice * item.quantity);
    }, 0);
  },
  
  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  }
}));
