import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }

    const db = await open({
      filename: './src/lib/mydatabase.db',
      driver: sqlite3.Database
    });

    const user = await db.get('SELECT * FROM User WHERE LOWER(email) = LOWER(?)', [email]);

    console.log('User fetched from DB:', user);
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (password.trim() !== user.password.trim()) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    let redirectTo = null;
    if (user.role === 'Group Admin') {
      redirectTo = '/group_admin';
    } else if (user.role === 'Team Member') {
      redirectTo = '/team_member';
    } else {
      return NextResponse.json({ message: 'Unauthorized role' }, { status: 403 });
    }

    return NextResponse.json({
      message: 'Login successful',
      redirectTo,
      role: user.role
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An error occurred, please try again' }, { status: 500 });
  }
}
