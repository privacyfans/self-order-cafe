import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId } = await params;
    
    const [rows] = await pool.execute(
      'SELECT * FROM tables WHERE id = ? AND is_active = true',
      [tableId]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
}
