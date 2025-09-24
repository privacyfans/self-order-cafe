import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID required' },
        { status: 400 }
      );
    }

    await pool.execute(`
      UPDATE order_items 
      SET status = 'SERVED', served_at = NOW() 
      WHERE id = ?
    `, [itemId]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Mark item served error:', error);
    return NextResponse.json(
      { error: 'Failed to mark item as served' },
      { status: 500 }
    );
  }
}
