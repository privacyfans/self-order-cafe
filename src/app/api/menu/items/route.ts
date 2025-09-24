import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [items] = await pool.execute(`
      SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.base_price,
        mi.image_url,
        mi.category_id,
        mi.is_available,
        mi.display_order,
        COALESCE(mi.preparation_time, 10) as preparation_time,
        COALESCE(mi.is_active, 1) as is_active,
        mi.sku,
        mc.name as category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      ORDER BY mi.display_order ASC, mi.name ASC
    `);

    return NextResponse.json({ items });

  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, base_price, category_id, image_url, is_available, display_order } = body;

    if (!name || !base_price || !category_id) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      `INSERT INTO menu_items (name, description, base_price, category_id, image_url, is_available, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, base_price, category_id, image_url || null, is_available !== false, display_order || 0]
    );

    return NextResponse.json({
      id: (result as { insertId: number }).insertId,
      success: true
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, base_price, category_id, image_url, is_available, display_order } = body;

    if (!id || !name || !base_price || !category_id) {
      return NextResponse.json(
        { error: 'ID, name, price, and category are required' },
        { status: 400 }
      );
    }

    await pool.execute(
      `UPDATE menu_items
       SET name = ?, description = ?, base_price = ?, category_id = ?,
           image_url = ?, is_available = ?, display_order = ?
       WHERE id = ?`,
      [name, description, base_price, category_id, image_url || null, is_available !== false, display_order || 0, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
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

    await pool.execute('DELETE FROM menu_items WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}
