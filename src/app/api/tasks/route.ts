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

    const tasks = await db.all(`
      SELECT 
        t.task_id, t.title, t.description, t.status, t.deadline, t.priority
      FROM Task t
    `);

    const comments = await db.all(`
      SELECT 
        comment_id, content, timestamp, task_id 
      FROM Comment
    `);

    const taskMap = tasks.map((task: any) => {
      return {
        ...task,
        comments: comments
          .filter((c) => c.task_id === task.task_id)
          .map((c) => ({
            content: c.content,
            timestamp: c.timestamp,
          })),
      };
    });

    return NextResponse.json(taskMap);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ message: 'Failed to fetch tasks' }, { status: 500 });
  }
}
