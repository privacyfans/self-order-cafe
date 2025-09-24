import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [categories] = await pool.execute(`
      SELECT id, name, description, display_order, icon_url, is_active 
      FROM menu_categories 
      WHERE is_active = true 
      ORDER BY display_order
    `);

    const [items] = await pool.execute(`
      SELECT 
        mi.id, mi.name, mi.description, mi.base_price, mi.image_url, 
        mi.category_id, mi.is_available, mc.name as category_name
      FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.is_active = true AND mc.is_active = true
      ORDER BY mc.display_order, mi.display_order
    `);

    return NextResponse.json({
      categories,
      items
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
}
