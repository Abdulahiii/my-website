import { NextRequest } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function getDB() {
  return open({
    filename: './src/lib/mydatabase.db',
    driver: sqlite3.Database,
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ message: 'Invalid task ID' }), { status: 400 });
  }

  const { status, comment } = await req.json();

  if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
    return new Response(JSON.stringify({ message: 'Invalid status value' }), { status: 400 });
  }

  try {
    const db = await getDB();
    const result = await db.run(
      'UPDATE Task SET status = ?, description = ? WHERE task_id = ?',
      [status, comment, id]
    );
    await db.close();

    if (result.changes === 0) {
      return new Response(JSON.stringify({ message: 'Task not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Task updated successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return new Response(JSON.stringify({ message: 'Failed to update task' }), { status: 500 });
  }
}
