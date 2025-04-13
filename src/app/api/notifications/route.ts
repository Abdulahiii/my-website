import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { NextRequest, NextResponse } from 'next/server';

async function getDB() {
  return open({
    filename: './src/lib/mydatabase.db',
    driver: sqlite3.Database,
  });
}

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();

    const notifications = await db.all(`
      SELECT notification_id, message, timestamp
      FROM Notification
      ORDER BY timestamp DESC
    `);

    await db.close();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ message: 'Failed to fetch notifications' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
    try {
      const { title, deadline, description, priority, status, user_id } = await req.json();
  
      if (!title || !deadline || !priority || !status || !user_id) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
      }
  
      const db = await getDB();
  
      const user = await db.get(`SELECT * FROM User WHERE user_id = ?`, [user_id]);
      if (!user) {
        return NextResponse.json({ message: `User ID ${user_id} does not exist.` }, { status: 400 });
      }
  
      const result = await db.run(
        `INSERT INTO Task (title, deadline, description, priority, status, user_id, tasklist_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, deadline, description, priority, status, Number(user_id), 1]
      );
  
      const newTaskId = result.lastID;
  
      const message = `A new task "${title}" has been assigned to TM${String(user_id).padStart(2, '0')}.`;
      await db.run(
        `INSERT INTO Notification (task_id, message) VALUES (?, ?)`,
        [newTaskId, message]
      );
  
      const newTask = {
        task_id: newTaskId,
        title,
        description,
        deadline,
        priority,
        status,
        user_id: Number(user_id),
        comments: [],
      };
  
      await db.close();
      return NextResponse.json(newTask);
    } catch (error) {
      console.error('POST error:', error);
      return NextResponse.json({ message: 'Failed to add task' }, { status: 500 });
    }
  }
  
  
