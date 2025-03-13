import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./src/lib/database.db');

export function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
