import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    const tasks = await db.all('SELECT * FROM Task');
    return Response.json(tasks);
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, comment } = body;

    const db = await connectToDatabase();

    if (status) {
      await db.run('UPDATE Task SET status = ? WHERE id = ?', [status, id]);
    }

    if (comment !== undefined) {
      await db.run('UPDATE Task SET comment = ? WHERE id = ?', [comment, id]);
    }

    return new Response(JSON.stringify({ message: 'Update successful' }), { status: 200 });
  } catch (error) {
    console.error('Database update error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
