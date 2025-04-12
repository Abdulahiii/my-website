import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { NextRequest, NextResponse } from 'next/server';

async function getDB() {
  return open({
    filename: './src/lib/mydatabase.db',
    driver: sqlite3.Database,
  });
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const taskId = Number(context.params.id);
  if (!taskId || isNaN(taskId)) {
    return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
  }

  const { title, description, status, priority, deadline } = await req.json();

  if (!title || !status || !priority || !deadline) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const validStatuses = ['Pending', 'In Progress', 'Completed'];
  const validPriorities = ['High', 'Medium', 'Low'];

  if (!validStatuses.includes(status) || !validPriorities.includes(priority)) {
    return NextResponse.json({ message: 'Invalid status or priority value' }, { status: 400 });
  }

  try {
    const db = await getDB();

    const result = await db.run(
      `
      UPDATE Task
      SET title = ?, description = ?, status = ?, priority = ?, deadline = ?
      WHERE task_id = ?
      `,
      [title, description, status, priority, deadline, taskId]
    );

    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ message: 'Task not found or not updated' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
