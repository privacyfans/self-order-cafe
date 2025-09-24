export interface MenuItem {
  id: number;
  name: string;
  description: string;
  base_price: number;
  image_url?: string;
  category_id: number;
  is_available: boolean;
  category_name?: string;
  preparation_time?: number;
}

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  icon_url?: string;
  is_active: boolean;
}

export interface Order {
  id: number;
  order_number: string;
  table_id: number;
  order_status: 'SUBMITTED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  payment_status: 'OUTSTANDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED';
  subtotal: number;
  service_charge: number;
  tax_amount: number;
  total_amount: number;
  submitted_at: Date;
  special_instructions?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions?: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
}

export interface CartItem {
  item_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  size_id?: number;
  size_name?: string;
  price_adjustment?: number;
  modifiers: Array<{
    modifier_id: number;
    name: string;
    price_adjustment: number;
    quantity: number;
  }>;
  special_instructions?: string;
}

export interface Table {
  id: number;
  table_number: string;
  qr_code: string;
  capacity: number;
  location_zone?: string;
  is_active: boolean;
  is_occupied: boolean;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_number: string;
  payment_method: 'CASH' | 'QRIS' | 'CARD';
  amount: number;
  amount_tendered?: number;
  change_amount?: number;
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  processed_by: string;
  processed_at: Date;
}

export interface Staff {
  id: number;
  employee_id: string;
  full_name: string;
  username: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN' | 'WAITER';
  is_active: boolean;
}
