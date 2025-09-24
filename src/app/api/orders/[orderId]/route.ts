import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  try {
    // Get order details
    const [orderResult] = await pool.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.table_id,
        o.order_status,
        o.payment_status,
        o.total_amount,
        o.submitted_at,
        o.special_instructions
      FROM orders o
      WHERE o.id = ?
    `, [orderId]);

    if (!Array.isArray(orderResult) || orderResult.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult[0];

    // Get order items
    const [itemsResult] = await pool.execute(`
      SELECT 
        oi.id,
        oi.item_id,
        oi.item_name,
        oi.quantity,
        oi.unit_price,
        oi.subtotal
      FROM order_items oi
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `, [orderId]);

    return NextResponse.json({
      order,
      items: itemsResult
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}
