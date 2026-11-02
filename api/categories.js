import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
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
        const categories = db.prepare(`
          SELECT c.*, 
            (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
          FROM categories c
          ORDER BY c.name ASC
        `).all();
        return res.status(200).json(categories);
      } catch (sqlErr) {
        console.warn('SQLite categories read error:', sqlErr.message);
      }
    }
  } catch (err) {
    console.error('API categories error:', err);
  }

  return res.status(200).json([
    { id: 1, name: 'Hot Coffee', slug: 'hot-coffee', product_count: 5 },
    { id: 2, name: 'Cold Brew & Iced', slug: 'cold-brew-iced', product_count: 3 },
    { id: 3, name: 'Specialty Beans', slug: 'specialty-beans', product_count: 2 },
    { id: 4, name: 'Bakery & Treats', slug: 'bakery-treats', product_count: 0 }
  ]);
}
