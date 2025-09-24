import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Update all READY items to SERVED for the specified order
    await pool.execute(
      `UPDATE order_items 
       SET status = 'SERVED', served_at = NOW() 
       WHERE order_id = ? AND status = 'READY'`,
      [orderId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all items as served:', error);
    return NextResponse.json({ error: 'Failed to mark items as served' }, { status: 500 });
  }
}
