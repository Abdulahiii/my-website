import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { NextRequest, NextResponse } from 'next/server';

async function getDB() {
  return open({
    filename: './src/lib/mydatabase.db',
    driver: sqlite3.Database,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, accountType } = await req.json();

    if (!firstName || !lastName || !email || !password || !accountType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const name = `${firstName} ${lastName}`;

    const db = await getDB();

    const existing = await db.get(`SELECT * FROM User WHERE email = ?`, [email]);
    if (existing) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }

    await db.run(
      `INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, password, accountType]
    );

    await db.close();
    return NextResponse.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Failed to register user' }, { status: 500 });
  }
}
