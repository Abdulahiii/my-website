import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function getDB() {
  return open({
    filename: './src/lib/mydatabase.db',
    driver: sqlite3.Database,
  });
}

export async function GET() {
  try {
    const db = await getDB();
    const taskLists = await db.all('SELECT * FROM TaskList');
    await db.close();
    return NextResponse.json(taskLists);
  } catch (error) {
    console.error('GET TaskLists error:', error);
    return NextResponse.json({ message: 'Failed to fetch task lists' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, user_id } = await req.json();

    if (!name || !user_id) {
      return NextResponse.json({ message: 'Missing name or user_id' }, { status: 400 });
    }

    const db = await getDB();

    const existing = await db.get('SELECT * FROM TaskList WHERE name = ?', [name]);
    if (existing) {
      await db.close();
      return NextResponse.json({ message: 'Task list with this name already exists' }, { status: 400 });
    }

    const result = await db.run(
      `INSERT INTO TaskList (name, user_id) VALUES (?, ?)`,
      [name, user_id]
    );

    const newList = {
      tasklist_id: result.lastID,
      name,
      user_id,
    };

    await db.close();
    return NextResponse.json(newList, { status: 201 });

  } catch (error) {
    console.error('POST TaskList error:', error);
    return NextResponse.json({ message: 'Failed to create task list' }, { status: 500 });
  }
}
