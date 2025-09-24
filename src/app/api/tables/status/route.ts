import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [tables] = await pool.execute(`
      SELECT 
        t.id,
        t.table_number,
        t.is_occupied,
        COALESCE(SUM(o.total_amount), 0) as outstanding_amount,
        COUNT(o.id) as order_count
      FROM tables t
      LEFT JOIN orders o ON t.id = o.table_id AND o.payment_status = 'OUTSTANDING'
      WHERE t.is_active = true
      GROUP BY t.id, t.table_number, t.is_occupied
      ORDER BY CAST(t.table_number AS UNSIGNED) ASC
    `);

    return NextResponse.json({
      tables
    });

  } catch (error) {
    console.error('Tables status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table status' },
      { status: 500 }
    );
  }
}
