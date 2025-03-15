import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any;

export async function connectToDatabase() {
  if (!db) {
    db = await open({
      filename: './src/lib/mydatabase.db', // Path to your existing database
      driver: sqlite3.Database,
    });
  }
  return db;
}

export async function getTasks() {
  const db = await connectToDatabase();
  return await db.all('SELECT * FROM Task');
}
