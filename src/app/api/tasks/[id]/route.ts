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
  const { status, comment } = await req.json();

  if (!taskId || isNaN(taskId)) {
    return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
  }

  if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
    return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
  }

  try {
    const db = await getDB();

    await db.run(
      `UPDATE Task SET status = ? WHERE task_id = ?`,
      [status, taskId]
    );

   
    if (comment && comment.trim() !== '') {
      await db.run(
        `INSERT INTO Comment (content, task_id, user_id) VALUES (?, ?, ?)`,
        [comment, taskId, 1] 
      );
    }

    await db.close();
    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ message: 'Failed to update task' }, { status: 500 });
  }
}
