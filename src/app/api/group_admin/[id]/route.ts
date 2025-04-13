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
  const { title, description, status, priority, deadline } = await req.json();

  try {
    const db = await getDB();

    await db.run(
      `UPDATE Task
       SET title = ?, description = ?, status = ?, priority = ?, deadline = ?
       WHERE task_id = ?`,
      [title, description, status, priority, deadline, taskId]
    );

    const taskOwner = await db.get('SELECT user_id FROM Task WHERE task_id = ?', [taskId]);

    await db.run(
      `INSERT INTO Notification (task_id, user_id, message)
       VALUES (?, ?, ?)`,
      [taskId, taskOwner.user_id, `Task ID ${taskId} was edited.`]
    );

    await db.close();

    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ message: 'Error editing task' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    const taskId = Number(context.params.id);
    if (!taskId) {
      return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
    }
    try {
      const db = await getDB();
  
      const result = await db.run('DELETE FROM Task WHERE task_id = ?', [taskId]);
  
      await db.close(); 
  
      if (result.changes === 0) {
        return NextResponse.json({ message: 'Task not found' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Task deleted successfully' });
    } catch (error: any) {
      return NextResponse.json(
        { message: 'Failed to delete task', error: error.message },
        { status: 500 }
      );
    }
  }
  