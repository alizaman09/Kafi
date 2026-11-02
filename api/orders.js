import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
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
        const orders = db.prepare(`
          SELECT o.*, 
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
          FROM orders o 
          ORDER BY o.created_at DESC
        `).all();
        return res.status(200).json(orders);
      } catch (sqlErr) {
        console.warn('SQLite orders read error:', sqlErr.message);
      }
    }
  } catch (err) {
    console.error('API orders error:', err);
  }

  return res.status(200).json([
    { id: 101, order_number: 'ORD-2026-001', customer_name: 'Zainab Fatima', total_amount: 850, order_status: 'Delivered', payment_status: 'Paid', created_at: '2026-11-01 10:15:00', item_count: 2 },
    { id: 102, order_number: 'ORD-2026-002', customer_name: 'Bilal Khan', total_amount: 650, order_status: 'Processing', payment_status: 'Pending', created_at: '2026-11-01 12:30:00', item_count: 1 },
    { id: 103, order_number: 'ORD-2026-003', customer_name: 'Ayesha Malik', total_amount: 1350, order_status: 'Pending', payment_status: 'Pending', created_at: '2026-11-01 15:45:00', item_count: 3 },
    { id: 104, order_number: 'ORD-2026-004', customer_name: 'Hamza Sheikh', total_amount: 950, order_status: 'Delivered', payment_status: 'Paid', created_at: '2026-11-02 09:20:00', item_count: 2 }
  ]);
}

