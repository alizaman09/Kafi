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
        const products = db.prepare(`
          SELECT p.*, c.name as category_name 
          FROM products p 
          LEFT JOIN categories c ON p.category_id = c.id 
          ORDER BY p.id DESC
        `).all();

        const formatted = products.map((p) => ({
          ...p,
          images: JSON.parse(p.images || '[]'),
          sizes: JSON.parse(p.sizes || '[]'),
          colors: JSON.parse(p.colors || '[]'),
          variants: JSON.parse(p.variants || '[]'),
          is_featured: Boolean(p.is_featured)
        }));

        return res.status(200).json(formatted);
      } catch (sqlErr) {
        console.warn('SQLite products read error:', sqlErr.message);
      }
    }
  } catch (err) {
    console.error('API products error:', err);
  }

  // Verified baseline products
  return res.status(200).json([
    {
      id: 1,
      name: 'Spanish Latte',
      slug: 'spanish-latte',
      sku: 'KF-LAT-001',
      regular_price: 750,
      sale_price: 699,
      category_name: 'Hot Coffee',
      stock_quantity: 4,
      status: 'in_stock',
      is_featured: true,
      images: ['/images/spanish-latte.png']
    },
    {
      id: 2,
      name: 'Ceremonial Matcha Latte',
      slug: 'ceremonial-matcha-latte',
      sku: 'KF-MTC-002',
      regular_price: 850,
      sale_price: 799,
      category_name: 'Specialty Brews',
      stock_quantity: 6,
      status: 'in_stock',
      is_featured: true,
      images: ['/images/matcha-latte.png']
    }
  ]);
}
