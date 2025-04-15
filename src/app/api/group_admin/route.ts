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
      SELECT Task.task_id, title, description, deadline, priority, status, Task.user_id, tasklist_id
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
  console.log('[POST] Task creation route hit');

  try {
    const { title, deadline, description, priority, status, user_id, tasklist_id } = await req.json();

    if (!title || !deadline || !priority || !status || !user_id) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDB();

    const user = await db.get('SELECT * FROM User WHERE user_id = ?', [user_id]);
    if (!user) {
      return NextResponse.json({ message: `User ID ${user_id} does not exist.` }, { status: 400 });
    }

    const result = await db.run(
      `INSERT INTO Task (title, description, status, deadline, priority, user_id, tasklist_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, status, deadline, priority, user_id, tasklist_id]
    );    

    const newTaskId = result.lastID;

    const message = `Task "${title}" was added and assigned to US#${String(user_id).padStart(2, '0')}.`;

    await db.run(
      'INSERT INTO Notification (task_id, user_id, message) VALUES (?, ?, ?)',
      [newTaskId, user_id, message]
    );
        
    await db.close();

    return NextResponse.json({
      message: 'Task added successfully',
      task: {
        task_id: newTaskId,
        title,
        description,
        deadline,
        priority,
        status,
        user_id,
        tasklist_id,
        comments: [],
      },
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to add task', error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}


export async function PATCH(req: NextRequest) {
  const { task_id, user_id } = await req.json();

  if (!task_id || !user_id) {
    return NextResponse.json({ message: 'Missing task_id or user_id' }, { status: 400 });
  }

  try {
    const db = await getDB();

    const userExists = await db.get('SELECT * FROM User WHERE user_id = ?', [user_id]);
    if (!userExists) {
      return NextResponse.json({ message: 'User ID does not exist' }, { status: 404 });
    }

    await db.run(
      'UPDATE Task SET user_id = ? WHERE task_id = ?',
      [user_id, task_id]
    );

    const message = `Task ID ${task_id} has been assigned to US#${String(user_id).padStart(2, '0')}.`;
    await db.run(
      'INSERT INTO Notification (task_id, user_id, message) VALUES (?, ?, ?)',
      [task_id, user_id, message]
    );

    await db.close();
    return NextResponse.json({ message: 'Task reassigned successfully' });
  } catch (error) {
    console.error('Error reassigning task:', error);
    return NextResponse.json({ message: 'Error reassigning task' }, { status: 500 });
  }
}

