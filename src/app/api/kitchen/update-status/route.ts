import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { orderId, itemId, status } = await request.json();

    if (!itemId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let actualOrderId = orderId;

    // If orderId is not provided, get it from itemId
    if (!actualOrderId) {
      const [orderResult] = await pool.execute(
        'SELECT order_id FROM order_items WHERE id = ?',
        [itemId]
      );

      if ((orderResult as { order_id: number }[]).length === 0) {
        return NextResponse.json(
          { error: 'Order item not found' },
          { status: 404 }
        );
      }

      actualOrderId = (orderResult as { order_id: number }[])[0].order_id;
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Update item status
      await connection.execute(
        'UPDATE order_items SET status = ? WHERE id = ? AND order_id = ?',
        [status, itemId, actualOrderId]
      );

      // Update timestamps based on status
      if (status === 'PREPARING') {
        await connection.execute(
          'UPDATE order_items SET prepared_at = NOW() WHERE id = ?',
          [itemId]
        );
      } else if (status === 'READY') {
        await connection.execute(
          'UPDATE order_items SET served_at = NOW() WHERE id = ?',
          [itemId]
        );
      }

      // Check if all items in order are ready, then update order status
      const [itemsStatus] = await connection.execute(`
        SELECT
          COUNT(*) as total_items,
          SUM(CASE WHEN status = 'READY' THEN 1 ELSE 0 END) as ready_items,
          SUM(CASE WHEN status = 'PREPARING' THEN 1 ELSE 0 END) as preparing_items
        FROM order_items
        WHERE order_id = ?
      `, [actualOrderId]);

      const stats = (itemsStatus as { total_items: number; ready_items: number; preparing_items: number }[])[0];

      if (stats.total_items === stats.ready_items) {
        // All items ready
        await connection.execute(
          'UPDATE orders SET order_status = "READY", ready_at = NOW() WHERE id = ?',
          [actualOrderId]
        );
      } else if (stats.preparing_items > 0 || stats.ready_items > 0) {
        // Some items preparing or ready
        await connection.execute(
          'UPDATE orders SET order_status = "PREPARING", preparing_at = NOW() WHERE id = ?',
          [actualOrderId]
        );
      }

      await connection.commit();
      
      return NextResponse.json({ success: true });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
