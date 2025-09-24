import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { full_name, email, phone_number, username, password, role, is_active } = await request.json();

    let updateQuery = 'UPDATE staff SET full_name = ?, email = ?, phone_number = ?, username = ?, role = ?, is_active = ?';
    const queryParams = [full_name, email, phone_number, username, role, is_active];

    // If password is provided, hash it and include in update
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      updateQuery += ', password_hash = ?';
      queryParams.push(password_hash);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    await query(updateQuery, queryParams);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error updating staff:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update staff' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await query('DELETE FROM staff WHERE id = ?', [id]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    );
  }
}
