import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
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
        const inventory = db.prepare(`
          SELECT p.id, p.name, p.sku, p.stock_quantity, p.status, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          ORDER BY p.stock_quantity ASC
        `).all();
        return res.status(200).json(inventory);
      } catch (sqlErr) {
        console.warn('SQLite inventory read error:', sqlErr.message);
      }
    }
  } catch (err) {
    console.error('API inventory error:', err);
  }

  return res.status(200).json([
    { id: 1, name: 'Spanish Latte', sku: 'KF-LAT-001', stock_quantity: 4, status: 'low_stock', category_name: 'Hot Coffee' },
    { id: 2, name: 'Ceremonial Matcha Latte', sku: 'KF-MTC-002', stock_quantity: 6, status: 'low_stock', category_name: 'Specialty Brews' },
    { id: 3, name: 'Cold Brew Reserve', sku: 'KF-CBD-003', stock_quantity: 18, status: 'in_stock', category_name: 'Cold Brew & Iced' }
  ]);
}

