import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const staff = await query(
      'SELECT id, employee_id, full_name, email, phone_number, username, role, is_active, last_login_at, created_at FROM staff ORDER BY created_at DESC'
    );

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { employee_id, full_name, email, phone_number, username, password, role } = await request.json();

    if (!employee_id || !full_name || !username || !password || !role) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO staff (employee_id, full_name, email, phone_number, username, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [employee_id, full_name, email, phone_number, username, password_hash, role]
    ) as any;

    return NextResponse.json({
      success: true,
      id: result.insertId
    });

  } catch (error: any) {
    console.error('Error creating staff:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Username or employee ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    );
  }
}
