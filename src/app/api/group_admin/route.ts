import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { NextRequest, NextResponse } from 'next/server';

async function getDB() {
  return open({
    filename: './src/lib/mydatabase.db',
    driver: sqlite3.Database,
  });
}

export async function GET() {
  try {
    const db = await getDB();

    const tasks = await db.all(`
      SELECT task_id, title, status, deadline, priority, user_id
      FROM Task
    `);

    const comments = await db.all(`
      SELECT content, timestamp, task_id
      FROM Comment
    `);

    const result = tasks.map((task) => {
      const taskComments = comments
        .filter((c) => c.task_id === task.task_id)
        .map((c) => ({
          content: c.content,
          timestamp: new Date(c.timestamp).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).replace(',', ''),
        }));

      return {
        ...task,
        comments: taskComments,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ message: 'Failed to load tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, deadline, priority, status, user_id } = await req.json();

    if (!title || !deadline || !priority || !status || !user_id) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDB();

    const user = await db.get(`SELECT * FROM User WHERE user_id = ?`, [user_id]);
    if (!user) {
      return NextResponse.json({ message: `User ID ${user_id} does not exist.` }, { status: 400 });
    }

    const result = await db.run(
      `INSERT INTO Task (title, deadline, priority, status, user_id, tasklist_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, deadline, priority, status, Number(user_id), 1]
    );

    const newTask = {
      task_id: result.lastID,
      title,
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
