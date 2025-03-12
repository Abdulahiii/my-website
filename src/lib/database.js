import Database from 'better-sqlite3';

const db = new Database('./mydatabase.db'); // Path is now correct

export default db;
