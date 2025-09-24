import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    await pool.execute(`
      UPDATE order_items 
      SET status = 'SERVED', served_at = NOW() 
      WHERE order_id = ? AND status = 'READY'
    `, [orderId]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Mark all ready items served error:', error);
    return NextResponse.json(
      { error: 'Failed to mark all ready items as served' },
      { status: 500 }
    );
  }
}
