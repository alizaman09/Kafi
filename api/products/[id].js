import fs from 'fs';
import path from 'path';
import { ORIGINAL_PRODUCTS } from '../products.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const numId = Number(id);

  const dbPath = path.join(process.cwd(), 'data', 'kafi.db');
  let db = null;
  if (fs.existsSync(dbPath)) {
    try {
      const { DatabaseSync } = await import('node:sqlite');
      db = new DatabaseSync(dbPath);
    } catch (e) {
      console.warn('SQLite init warning:', e.message);
    }
  }

  // 1. GET SINGLE PRODUCT
  if (req.method === 'GET') {
    if (db) {
      try {
        const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(numId);
        if (prod) {
          let parsedImages = [];
          try {
            parsedImages = JSON.parse(prod.images || '[]');
          } catch {
            parsedImages = prod.images ? [prod.images] : [];
          }
          return res.status(200).json({
            ...prod,
            images: parsedImages,
            sizes: JSON.parse(prod.sizes || '[]'),
            colors: JSON.parse(prod.colors || '[]'),
            variants: JSON.parse(prod.variants || '[]'),
            is_featured: Boolean(prod.is_featured)
          });
        }
      } catch (err) {
        console.warn('SQLite get product error:', err.message);
      }
    }

    const baseline = ORIGINAL_PRODUCTS.find(p => p.id === numId);
    if (baseline) return res.status(200).json(baseline);
    return res.status(404).json({ error: 'Product not found' });
  }

  // 2. UPDATE PRODUCT (PUT)
  if (req.method === 'PUT') {
    const { name, description, regular_price, category_id, images, is_featured } = req.body || {};
    const finalImages = Array.isArray(images) ? images : (images ? [images] : []);

    const updated = {
      id: numId,
      name: name ? name.trim() : '',
      description: description || '',
      regular_price: regular_price !== undefined ? Number(regular_price) : 0,
      category_id: category_id ? Number(category_id) : null,
      images: finalImages,
      is_featured: Boolean(is_featured)
    };

    if (db) {
      try {
        db.prepare(`
          UPDATE products
          SET name = COALESCE(?, name),
              description = COALESCE(?, description),
              regular_price = COALESCE(?, regular_price),
              category_id = COALESCE(?, category_id),
              images = COALESCE(?, images),
              is_featured = COALESCE(?, is_featured)
          WHERE id = ?
        `).run(
          updated.name,
          updated.description,
          updated.regular_price,
          updated.category_id,
          JSON.stringify(updated.images),
          is_featured !== undefined ? (is_featured ? 1 : 0) : null,
          numId
        );
      } catch (err) {
        console.warn('SQLite update product error:', err.message);
      }
    }

    return res.status(200).json({ success: true, product: updated });
  }

  // 3. DELETE PRODUCT (DELETE)
  if (req.method === 'DELETE') {
    if (db) {
      try {
        db.prepare('DELETE FROM products WHERE id = ?').run(numId);
      } catch (err) {
        console.warn('SQLite delete product error:', err.message);
      }
    }
    return res.status(200).json({ success: true, message: 'Product deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
