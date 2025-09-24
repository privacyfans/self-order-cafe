import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Fetch data
    const [orders] = await pool.execute(`
      SELECT 
        o.order_number,
        o.table_id,
        o.total_amount,
        o.submitted_at
      FROM orders o
      WHERE DATE(o.submitted_at) = ?
      ORDER BY o.submitted_at DESC
      LIMIT 100
    `, [date]);

    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
      WHERE DATE(submitted_at) = ?
        AND payment_status = 'PAID'
    `, [date]);

    if (format === 'excel') {
      // Generate CSV format for Excel
      const summaryData = (summary as any[])[0] || { total_orders: 0, total_revenue: 0 };
      let csv = 'Sales Report\n';
      csv += `Date,${date}\n`;
      csv += `Total Orders,${summaryData.total_orders}\n`;
      csv += `Total Revenue,${summaryData.total_revenue}\n\n`;
      csv += 'Order Number,Table,Amount,Date\n';
      
      (orders as any[]).forEach(order => {
        csv += `${order.order_number},${order.table_id},${order.total_amount},${new Date(order.submitted_at).toLocaleString()}\n`;
      });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="sales-report-${date}.csv"`
        }
      });
    } else {
      // Generate HTML that can be printed as PDF
      const summaryData = (summary as any[])[0] || { total_orders: 0, total_revenue: 0 };
      const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Sales Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Sales Report - ${date}</h1>
    
    <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Orders:</strong> ${summaryData.total_orders}</p>
        <p><strong>Total Revenue:</strong> Rp ${summaryData.total_revenue.toLocaleString('id-ID')}</p>
    </div>

    <h3>Orders</h3>
    <table>
        <thead>
            <tr>
                <th>Order Number</th>
                <th>Table</th>
                <th>Amount</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            ${(orders as any[]).map(order => `
                <tr>
                    <td>${order.order_number}</td>
                    <td>${order.table_id}</td>
                    <td>Rp ${order.total_amount.toLocaleString('id-ID')}</td>
                    <td>${new Date(order.submitted_at).toLocaleString('id-ID')}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="sales-report-${date}.html"`
        }
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Export failed' }, { status: 500 });
  }
}
