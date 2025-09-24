import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const range = searchParams.get('range') || 'today';

    // Calculate date range
    let startDate = date;
    const endDate = date;
    
    if (range === 'week') {
      const d = new Date(date);
      d.setDate(d.getDate() - 6);
      startDate = d.toISOString().split('T')[0];
    } else if (range === 'month') {
      const d = new Date(date);
      d.setDate(1);
      startDate = d.toISOString().split('T')[0];
    }

    // Daily summary with payment methods from payments table
    const [dailyData] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value,
        COALESCE(SUM(CASE WHEN p.payment_method = 'CASH' THEN p.amount ELSE 0 END), 0) as cash_total,
        COALESCE(SUM(CASE WHEN p.payment_method = 'QRIS' THEN p.amount ELSE 0 END), 0) as qris_total,
        COALESCE(SUM(CASE WHEN p.payment_method IN ('DEBIT_CARD', 'CREDIT_CARD') THEN p.amount ELSE 0 END), 0) as card_total
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id AND p.payment_status = 'COMPLETED'
      WHERE DATE(o.submitted_at) BETWEEN ? AND ?
        AND o.payment_status = 'PAID'
    `, [startDate, endDate]);

    // Popular items
    const [popularItems] = await pool.execute(`
      SELECT 
        oi.item_name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_revenue,
        ROUND(
          (SUM(oi.subtotal) / NULLIF((
            SELECT SUM(total_amount) 
            FROM orders 
            WHERE DATE(submitted_at) BETWEEN ? AND ? 
              AND payment_status = 'PAID'
          ), 0)) * 100, 1
        ) as percentage
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.submitted_at) BETWEEN ? AND ?
        AND o.payment_status = 'PAID'
      GROUP BY oi.item_name
      ORDER BY total_quantity DESC
      LIMIT 10
    `, [startDate, endDate, startDate, endDate]);

    // Hourly sales
    const [hourlySales] = await pool.execute(`
      SELECT 
        HOUR(o.submitted_at) as hour,
        COUNT(*) as orders,
        COALESCE(SUM(o.total_amount), 0) as revenue
      FROM orders o
      WHERE DATE(o.submitted_at) BETWEEN ? AND ?
        AND o.payment_status = 'PAID'
      GROUP BY HOUR(o.submitted_at)
      ORDER BY hour
    `, [startDate, endDate]);

    const daily = (dailyData as any[])[0] || {
      total_orders: 0,
      total_revenue: 0,
      avg_order_value: 0,
      cash_total: 0,
      qris_total: 0,
      card_total: 0
    };

    // Format response
    const response = {
      daily: {
        date: endDate,
        total_orders: daily.total_orders,
        total_revenue: daily.total_revenue,
        avg_order_value: daily.avg_order_value,
        payment_methods: {
          cash: daily.cash_total,
          qris: daily.qris_total,
          card: daily.card_total
        }
      },
      popular_items: popularItems,
      hourly: Array.from({ length: 24 }, (_, hour) => {
        const found = (hourlySales as any[]).find(h => h.hour === hour);
        return {
          hour,
          orders: found?.orders || 0,
          revenue: found?.revenue || 0
        };
      })
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
