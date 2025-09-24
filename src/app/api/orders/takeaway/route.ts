import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { customer_name, customer_phone, items } = await request.json();

    if (!customer_name || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name and items are required' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `TO${Date.now().toString().slice(-6)}`;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.unit_price * item.quantity), 0
    );
    const total = subtotal;

    // Create customer if phone provided
    let customerId = null;
    if (customer_phone) {
      const existingCustomer = await query(
        'SELECT id FROM customers WHERE phone_number = ?',
        [customer_phone]
      ) as any[];

      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
      } else {
        const customerResult = await query(
          'INSERT INTO customers (phone_number, full_name, is_guest) VALUES (?, ?, 1)',
          [customer_phone, customer_name]
        ) as any;
        customerId = customerResult.insertId;
      }
    }

    // Create order
    const orderResult = await query(
      `INSERT INTO orders (
        order_number, customer_id, order_type, order_status, 
        payment_status, subtotal, total_amount, submitted_at
      ) VALUES (?, ?, 'TAKEAWAY', 'SUBMITTED', 'OUTSTANDING', ?, ?, NOW())`,
      [orderNumber, customerId, subtotal, total]
    ) as any;

    const orderId = orderResult.insertId;

    // Add order items
    for (const item of items) {
      await query(
        `INSERT INTO order_items (
          order_id, item_id, item_name, quantity, unit_price, subtotal
        ) VALUES (?, ?, (SELECT name FROM menu_items WHERE id = ?), ?, ?, ?)`,
        [orderId, item.item_id, item.item_id, item.quantity, item.unit_price, item.unit_price * item.quantity]
      );
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      order_number: orderNumber
    });

  } catch (error) {
    console.error('Error creating takeaway order:', error);
    return NextResponse.json(
      { error: 'Failed to create takeaway order' },
      { status: 500 }
    );
  }
}
