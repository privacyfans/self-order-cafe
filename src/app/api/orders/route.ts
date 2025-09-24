import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Order, OrderItem } from '@/types';

export async function GET() {
  try {
    // Get all orders
    const [orders] = await pool.execute(`
      SELECT
        o.id,
        o.order_number,
        o.table_id,
        o.order_status,
        o.payment_status,
        o.total_amount,
        o.submitted_at
      FROM orders o
      ORDER BY o.submitted_at DESC
    `);

    // Ensure orders is an array
    const ordersArray = Array.isArray(orders) ? orders : [];

    // Get items for each order
    const ordersWithItems = await Promise.all(
      ordersArray.map(async (order: any) => {
        const [items] = await pool.execute(`
          SELECT
            oi.id,
            oi.item_name,
            oi.quantity,
            oi.unit_price,
            oi.subtotal,
            oi.status,
            oi.special_instructions
          FROM order_items oi
          WHERE oi.order_id = ?
          ORDER BY oi.id
        `, [order.id]);

        return {
          ...order,
          items: items as OrderItem[]
        };
      })
    );

    return NextResponse.json({
      orders: ordersWithItems
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { orders: [], error: 'Failed to fetch orders' },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { tableId, items, orderType = 'DINE_IN' } = await request.json();
    
    if (!tableId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // For takeaway orders, use table_id = 7 (existing TAKEAWAY table)
      // For dine-in orders, check existing unpaid orders for that table
      let existingOrderQuery: string;
      let queryParams: (string | number)[];
      let actualTableId: number;
      
      if (tableId === 'takeaway') {
        actualTableId = 7; // Use existing TAKEAWAY table ID
        existingOrderQuery = `
          SELECT id, order_number, total_amount 
          FROM orders 
          WHERE table_id = 7 AND payment_status = 'OUTSTANDING'
          ORDER BY submitted_at DESC 
          LIMIT 1
        `;
        queryParams = [];
      } else {
        actualTableId = parseInt(tableId);
        existingOrderQuery = `
          SELECT id, order_number, total_amount 
          FROM orders 
          WHERE table_id = ? AND payment_status = 'OUTSTANDING'
          ORDER BY submitted_at DESC 
          LIMIT 1
        `;
        queryParams = [actualTableId];
      }

      const [existingOrders] = await connection.execute(existingOrderQuery, queryParams);

      let orderId: number;
      let orderNumber: string;

      if (Array.isArray(existingOrders) && existingOrders.length > 0) {
        // Add to existing order
        const existingOrder = existingOrders[0] as { id: number; order_number: string; total_amount: number };
        orderId = existingOrder.id;
        orderNumber = existingOrder.order_number;
        
        // Insert new items to existing order
        for (const item of items) {
          await connection.execute(
            `INSERT INTO order_items (
              order_id, 
              item_id, 
              item_name, 
              quantity, 
              unit_price, 
              subtotal,
              status,
              special_instructions
            ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
            [
              orderId, 
              item.item_id, 
              item.name,
              item.quantity, 
              item.unit_price, 
              item.subtotal,
              item.special_instructions || null
            ]
          );
        }

        // Update order total
        const newSubtotal = items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0);
        await connection.execute(
          `UPDATE orders 
           SET subtotal = subtotal + ?, total_amount = total_amount + ?
           WHERE id = ?`,
          [newSubtotal, newSubtotal, orderId]
        );

      } else {
        // Create new order
        orderNumber = `ORD-${Date.now()}`;
        const subtotal = items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0);
        
        const [orderResult] = await connection.execute(
          `INSERT INTO orders (
            order_number, 
            table_id, 
            order_type, 
            order_status, 
            payment_status, 
            subtotal, 
            total_amount
          ) VALUES (?, ?, ?, 'SUBMITTED', 'OUTSTANDING', ?, ?)`,
          [orderNumber, actualTableId, orderType, subtotal, subtotal]
        );
        
        orderId = (orderResult as { insertId: number }).insertId;
        
        // Insert order items
        for (const item of items) {
          await connection.execute(
            `INSERT INTO order_items (
              order_id, 
              item_id, 
              item_name, 
              quantity, 
              unit_price, 
              subtotal,
              status,
              special_instructions
            ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
            [
              orderId, 
              item.item_id, 
              item.name,
              item.quantity, 
              item.unit_price, 
              item.subtotal,
              item.special_instructions || null
            ]
          );
        }
      }
      
      await connection.commit();
      
      return NextResponse.json({ 
        success: true, 
        orderId, 
        orderNumber,
        isNewOrder: Array.isArray(existingOrders) && existingOrders.length === 0
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('Database error:', error);
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
