import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [tables] = await pool.execute(`
      SELECT
        t.id,
        t.table_number,
        t.qr_code,
        t.capacity,
        t.location_zone,
        t.is_active,
        t.is_occupied,
        t.created_at,
        t.updated_at,
        COALESCE(SUM(o.total_amount), 0) as outstanding_amount,
        COUNT(o.id) as order_count
      FROM tables t
      LEFT JOIN orders o ON t.id = o.table_id AND o.payment_status = 'OUTSTANDING'
      GROUP BY t.id, t.table_number, t.qr_code, t.capacity, t.location_zone, t.is_active, t.is_occupied, t.created_at, t.updated_at
      ORDER BY CAST(t.table_number AS UNSIGNED) ASC
    `);

    return NextResponse.json(tables);

  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { table_number, capacity, location_zone, is_active = true } = body;

    if (!table_number) {
      return NextResponse.json(
        { error: 'Table number is required' },
        { status: 400 }
      );
    }

    // Generate QR code URL for this table
    const qr_code = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/menu/${table_number}`;

    const [result] = await pool.execute(
      `INSERT INTO tables (table_number, qr_code, capacity, location_zone, is_active, is_occupied)
       VALUES (?, ?, ?, ?, ?, false)`,
      [table_number, qr_code, capacity || 4, location_zone || null, is_active]
    );

    return NextResponse.json({
      id: (result as { insertId: number }).insertId,
      success: true
    });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, table_number, capacity, location_zone, is_active, is_occupied } = body;

    if (!id || !table_number) {
      return NextResponse.json(
        { error: 'ID and table number are required' },
        { status: 400 }
      );
    }

    // Update QR code if table number changed
    const qr_code = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/menu/${table_number}`;

    await pool.execute(
      `UPDATE tables
       SET table_number = ?, qr_code = ?, capacity = ?, location_zone = ?,
           is_active = ?, is_occupied = ?
       WHERE id = ?`,
      [table_number, qr_code, capacity || 4, location_zone || null, is_active !== false, is_occupied !== false, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Check if table has outstanding orders
    const [orders] = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE table_id = ? AND payment_status = "OUTSTANDING"',
      [id]
    );

    if ((orders as { count: number }[])[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete table with outstanding orders' },
        { status: 400 }
      );
    }

    await pool.execute('DELETE FROM tables WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    );
  }
}