import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Order, OrderItem } from '@/types';

export async function GET() {
  try {
    // Get outstanding orders
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
      WHERE o.payment_status = 'OUTSTANDING'
      ORDER BY 
        CASE WHEN o.order_status = 'READY' THEN 0 ELSE 1 END,
        o.submitted_at ASC
    `);

    // Get items for each order
    const ordersWithItems = await Promise.all(
      (orders as Order[]).map(async (order) => {
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

    // Get stats
    const [statsResult] = await pool.execute(`
      SELECT 
        COUNT(*) as totalOutstanding,
        COALESCE(SUM(total_amount), 0) as totalAmount,
        (SELECT COUNT(*) FROM orders WHERE DATE(submitted_at) = CURDATE()) as todayOrders
      FROM orders 
      WHERE payment_status = 'OUTSTANDING'
    `);

    const stats = Array.isArray(statsResult) && statsResult.length > 0 
      ? statsResult[0] 
      : { totalOutstanding: 0, totalAmount: 0, todayOrders: 0 };

    return NextResponse.json({
      orders: ordersWithItems,
      stats
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outstanding orders' },
      { status: 500 }
    );
  }
}
