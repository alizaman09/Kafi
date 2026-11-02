import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const dbPath = path.join(process.cwd(), 'data', 'kafi.db');
    if (fs.existsSync(dbPath)) {
      try {
        const { DatabaseSync } = await import('node:sqlite');
        const db = new DatabaseSync(dbPath);
        const customers = db.prepare('SELECT * FROM customers ORDER BY id DESC').all();
        return res.status(200).json(customers);
      } catch (sqlErr) {
        console.warn('SQLite customers read error:', sqlErr.message);
      }
    }
  } catch (err) {
    console.error('API customers error:', err);
  }

  return res.status(200).json([
    { id: 1, name: 'Zainab Fatima', email: 'zainab@example.com', phone: '03001234567', city: 'Lahore', total_orders: 5, total_spent: 3850 },
    { id: 2, name: 'Bilal Khan', email: 'bilal@example.com', phone: '03009876543', city: 'Lahore', total_orders: 2, total_spent: 1300 },
    { id: 3, name: 'Ayesha Malik', email: 'ayesha@example.com', phone: '03215554321', city: 'Lahore', total_orders: 3, total_spent: 2950 },
    { id: 4, name: 'Hamza Sheikh', email: 'hamza@example.com', phone: '03337778899', city: 'Lahore', total_orders: 1, total_spent: 950 }
  ]);
}

