import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Order, OrderItem } from '@/types';

export async function GET() {
  try {
    // Get orders that are not completed
    const [orders] = await pool.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.table_id,
        o.submitted_at
      FROM orders o
      WHERE o.order_status IN ('SUBMITTED', 'PREPARING', 'READY')
      AND o.payment_status = 'OUTSTANDING'
      ORDER BY o.submitted_at ASC
    `);

    // Get items for each order
    const ordersWithItems = await Promise.all(
      (orders as Order[]).map(async (order) => {
        const [items] = await pool.execute(`
          SELECT 
            oi.id,
            oi.item_name,
            oi.quantity,
            oi.status
          FROM order_items oi
          WHERE oi.order_id = ?
          AND oi.status IN ('PENDING', 'PREPARING', 'READY')
          ORDER BY oi.id
        `, [order.id]);

        return {
          ...order,
          items: items as OrderItem[]
        };
      })
    );

    // Filter out orders with no pending/preparing items
    const activeOrders = ordersWithItems.filter(order => (order.items as OrderItem[]).length > 0);

    return NextResponse.json({
      orders: activeOrders
    });

  } catch (error) {
    console.error('Kitchen orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kitchen orders' },
      { status: 500 }
    );
  }
}
