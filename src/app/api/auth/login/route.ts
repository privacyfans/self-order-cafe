import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get staff from database
    const staff = await query(
      'SELECT * FROM staff WHERE username = ? AND is_active = TRUE',
      [username]
    ) as any[];

    if (!staff || staff.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const staffMember = staff[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, staffMember.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await query(
      'UPDATE staff SET last_login_at = NOW() WHERE id = ?',
      [staffMember.id]
    );

    // Return staff info (without password)
    const { password_hash: _, ...staffInfo } = staffMember;

    return NextResponse.json({
      success: true,
      staff: staffInfo
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
