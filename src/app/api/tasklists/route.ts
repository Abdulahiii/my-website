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
    const body = await req.json();
    const { name, user_id } = body;

    if (!name || !user_id) {
      return NextResponse.json({ message: 'Missing name or user_id' }, { status: 400 });
    }

    const db = await open({
      filename: './src/lib/mydatabase.db',
      driver: sqlite3.Database,
    });

    const existing = await db.get(
      'SELECT * FROM TaskList WHERE LOWER(name) = LOWER(?) AND user_id = ?',
      [name.trim(), user_id]
    );
    
    if (existing) {
      await db.close();
      return NextResponse.json({ message: 'A task list with that name already exists.' }, { status: 400 });
    }
    
    const result = await db.run(
      'INSERT INTO TaskList (name, user_id) VALUES (?, ?)',
      [name, user_id]
    );

    const message = `A new task list "${name.trim()}" has been created.`;
    await db.run(
      'INSERT INTO Notification (task_id, user_id, message) VALUES (?, ?, ?)',
      [null, user_id, message]
    );    

    const tasklist = await db.get('SELECT * FROM TaskList WHERE tasklist_id = ?', [result.lastID]);

    return NextResponse.json(tasklist, { status: 201 });

  } catch (err) {
    console.error('Error creating task list:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}