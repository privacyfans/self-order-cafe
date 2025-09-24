import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [categories] = await pool.execute(`
      SELECT *
      FROM menu_categories
      ORDER BY display_order ASC, name ASC
    `);

    return NextResponse.json({ categories });

  } catch (error) {
    console.error('Error fetching menu categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, is_active, display_order } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      `INSERT INTO menu_categories (name, description, is_active, display_order)
       VALUES (?, ?, ?, ?)`,
      [name, description || null, is_active !== false, display_order || 0]
    );

    return NextResponse.json({
      id: (result as { insertId: number }).insertId,
      success: true
    });
  } catch (error) {
    console.error('Error creating menu category:', error);
    return NextResponse.json(
      { error: 'Failed to create menu category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, is_active, display_order } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      );
    }

    await pool.execute(
      `UPDATE menu_categories
       SET name = ?, description = ?, is_active = ?, display_order = ?
       WHERE id = ?`,
      [name, description || null, is_active !== false, display_order || 0, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating menu category:', error);
    return NextResponse.json(
      { error: 'Failed to update menu category' },
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

    const [items] = await pool.execute(
      'SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?',
      [id]
    );

    if ((items as { count: number }[])[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing menu items' },
        { status: 400 }
      );
    }

    await pool.execute('DELETE FROM menu_categories WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu category:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu category' },
      { status: 500 }
    );
  }
}
