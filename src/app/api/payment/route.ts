import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { orderId, paymentMethod, amount, amountTendered } = await request.json();

    // Validate input
    if (!orderId || !paymentMethod || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Map payment method to match enum values
    const methodMap: { [key: string]: string } = {
      'CASH': 'CASH',
      'QRIS': 'QRIS', 
      'CARD': 'DEBIT_CARD'
    };

    const mappedMethod = methodMap[paymentMethod] || 'CASH';

    // Calculate change for cash payments
    const changeAmount = paymentMethod === 'CASH' ? (amountTendered || amount) - amount : 0;

    // Generate payment number
    const paymentNumber = `PAY-${Date.now()}`;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert payment record (using dummy staff ID 1)
      await connection.execute(`
        INSERT INTO payments (
          order_id, 
          payment_number, 
          payment_method, 
          amount, 
          amount_tendered, 
          change_amount, 
          processed_by, 
          payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, 1, 'COMPLETED')
      `, [
        orderId, 
        paymentNumber, 
        mappedMethod, 
        amount, 
        amountTendered || amount, 
        changeAmount
      ]);

      // Update order payment status
      await connection.execute(`
        UPDATE orders 
        SET payment_status = 'PAID'
        WHERE id = ?
      `, [orderId]);

      // Commit transaction
      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        paymentNumber,
        changeAmount
      });

    } catch (error) {
      // Rollback transaction
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
