import fs from 'fs';
import path from 'path';

export const ORIGINAL_PRODUCTS = [
  {
    id: 1,
    name: 'Caramel Macchiato',
    slug: 'caramel-macchiato',
    description: 'A caramel macchiato is a layered espresso drink with steamed milk and caramel drizzle.',
    sku: 'KF-MAC-01',
    regular_price: 150,
    sale_price: 150,
    category_id: 1,
    category_name: 'Hot Coffee',
    images: ['/assets/cups/cup_clean_1.png'],
    sizes: ['Regular', 'Large'],
    colors: [],
    variants: [],
    stock_quantity: 30,
    is_featured: true,
    status: 'in_stock'
  },
  {
    id: 2,
    name: 'Americano',
    slug: 'americano',
    description: 'Single coffee drink made by diluting espresso with hot water, giving it a smooth, bold flavor.',
    sku: 'KF-AME-02',
    regular_price: 130,
    sale_price: 130,
    category_id: 1,
    category_name: 'Hot Coffee',
    images: ['/assets/cups/cup_clean_2.png'],
    sizes: ['Regular', 'Large'],
    colors: [],
    variants: [],
    stock_quantity: 30,
    is_featured: true,
    status: 'in_stock'
  },
  {
    id: 3,
    name: 'Cappuccino',
    slug: 'cappuccino',
    description: 'A cappuccino is an espresso-based drink with equal parts espresso, steamed milk, and milk foam.',
    sku: 'KF-CAP-03',
    regular_price: 200,
    sale_price: 200,
    category_id: 1,
    category_name: 'Hot Coffee',
    images: ['/assets/cups/cup_clean_3.png'],
    sizes: ['Regular', 'Large'],
    colors: [],
    variants: [],
    stock_quantity: 30,
    is_featured: true,
    status: 'in_stock'
  },
  {
    id: 4,
    name: 'Flat White',
    slug: 'flat-white',
    description: 'Creamy espresso with microfoam.',
    sku: 'KF-FLA-04',
    regular_price: 125,
    sale_price: 125,
    category_id: 1,
    category_name: 'Hot Coffee',
    images: ['/assets/cups/cup_clean_4.png'],
    sizes: ['Regular', 'Large'],
    colors: [],
    variants: [],
    stock_quantity: 30,
    is_featured: true,
    status: 'in_stock'
  },
  {
    id: 5,
    name: 'Espresso',
    slug: 'espresso',
    description: 'Espresso stained with a small amount of milk.',
    sku: 'KF-ESP-05',
    regular_price: 160,
    sale_price: 160,
    category_id: 1,
    category_name: 'Hot Coffee',
    images: ['/assets/cups/cup_clean_5.png'],
    sizes: ['Regular', 'Large'],
    colors: [],
    variants: [],
    stock_quantity: 30,
    is_featured: true,
    status: 'in_stock'
  },
  {
    id: 6,
    name: 'Café Mocha',
    slug: 'cafe-mocha',
    description: 'Coffee with chocolate and milk.',
    sku: 'KF-MOC-06',
    regular_price: 140,
    sale_price: 140,
    category_id: 1,
    category_name: 'Hot Coffee',
    images: ['/assets/cups/cup_clean_6.png'],
    sizes: ['Regular', 'Large'],
    colors: [],
    variants: [],
    stock_quantity: 30,
    is_featured: true,
    status: 'in_stock'
  },
  {
    id: 7,
    name: 'Cold Brew',
    slug: 'cold-brew',
    description: 'Slowly steeped coffee served chilled.',
    sku: 'KF-COL-07',
    regular_price: 145,
    sale_price: 145,
    category_id: 2,
    category_name: 'Cold Brew & Iced',
    images: ['/assets/cups/cup_clean_7.png'],
    sizes: ['Regular', 'Large'],
    colors: [],
    variants: [],
    stock_quantity: 30,
    is_featured: true,
    status: 'in_stock'
  },
  {
    id: 8,
    name: 'Ristretto',
    slug: 'ristretto',
    description: 'A shorter, more concentrated espresso.',
    sku: 'KF-RIS-08',
    regular_price: 150,
    sale_price: 150,
    category_id: 1,
    category_name: 'Hot Coffee',
    images: ['/assets/cups/cup_clean_8.png'],
    sizes: ['Regular', 'Large'],
    colors: [],
    variants: [],
    stock_quantity: 30,
    is_featured: true,
    status: 'in_stock'
  },
  {
    id: 9,
    name: 'Café au Lait',
    slug: 'cafe-au-lait',
    description: 'Brewed coffee with steamed milk.',
    sku: 'KF-LAI-09',
    regular_price: 130,
    sale_price: 130,
    category_id: 1,
    category_name: 'Hot Coffee',
    images: ['/assets/cups/cup_clean_9.png'],
    sizes: ['Regular', 'Large'],
    colors: [],
    variants: [],
    stock_quantity: 30,
    is_featured: true,
    status: 'in_stock'
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

  // 1. GET ALL PRODUCTS
  if (req.method === 'GET') {
    if (db) {
      try {
        const products = db.prepare(`
          SELECT p.*, c.name as category_name 
          FROM products p 
          LEFT JOIN categories c ON p.category_id = c.id 
          ORDER BY p.id ASC
        `).all();

        if (products && products.length > 0) {
          const formatted = products.map((p) => {
            let parsedImages = [];
            try {
              parsedImages = JSON.parse(p.images || '[]');
            } catch (err) {
              parsedImages = p.images ? [p.images] : [];
            }
            return {
              ...p,
              images: parsedImages,
              sizes: JSON.parse(p.sizes || '[]'),
              colors: JSON.parse(p.colors || '[]'),
              variants: JSON.parse(p.variants || '[]'),
              is_featured: Boolean(p.is_featured)
            };
          });

          // Ensure all 9 baseline original products exist
          const existingIds = new Set(formatted.map(p => p.id));
          const completeCatalog = [...formatted];
          for (const orig of ORIGINAL_PRODUCTS) {
            if (!existingIds.has(orig.id)) {
              completeCatalog.push(orig);
            }
          }
          return res.status(200).json(completeCatalog);
        }
      } catch (sqlErr) {
        console.warn('SQLite products read error:', sqlErr.message);
      }
    }

    // Baseline catalog guarantee
    return res.status(200).json(ORIGINAL_PRODUCTS);
  }

  // 2. CREATE PRODUCT (POST)
  if (req.method === 'POST') {
    const { name, regular_price, description, category_id, images, is_featured } = req.body || {};
    if (!name || regular_price === undefined) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    const newProd = {
      id: Date.now(),
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: description || '',
      sku: 'KF-' + Date.now().toString().slice(-6),
      regular_price: Number(regular_price),
      sale_price: Number(regular_price),
      category_id: category_id ? Number(category_id) : 1,
      images: Array.isArray(images) ? images : (images ? [images] : []),
      sizes: ['Regular', 'Large'],
      colors: [],
      variants: [],
      stock_quantity: 999,
      is_featured: Boolean(is_featured),
      status: 'in_stock'
    };

    if (db) {
      try {
        const stmt = db.prepare(`
          INSERT INTO products (name, slug, description, sku, regular_price, category_id, images, sizes, colors, variants, stock_quantity, is_featured, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
          newProd.name,
          newProd.slug,
          newProd.description,
          newProd.sku,
          newProd.regular_price,
          newProd.category_id,
          JSON.stringify(newProd.images),
          JSON.stringify(newProd.sizes),
          JSON.stringify(newProd.colors),
          JSON.stringify(newProd.variants),
          newProd.stock_quantity,
          newProd.is_featured ? 1 : 0,
          newProd.status
        );
        newProd.id = Number(result.lastInsertRowid);
      } catch (err) {
        console.warn('SQLite insert error:', err.message);
      }
    }

    return res.status(201).json(newProd);
  }

  // 3. UPDATE PRODUCT (PUT)
  if (req.method === 'PUT') {
    const { name, regular_price, description, category_id, images, is_featured } = req.body || {};
    const updated = {
      ...req.body,
      name: name ? name.trim() : undefined,
      regular_price: regular_price !== undefined ? Number(regular_price) : undefined,
      images: Array.isArray(images) ? images : (images ? [images] : [])
    };

    if (db && req.query && req.query.id) {
      try {
        const id = Number(req.query.id);
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
          description,
          updated.regular_price,
          category_id ? Number(category_id) : null,
          JSON.stringify(updated.images),
          is_featured !== undefined ? (is_featured ? 1 : 0) : null,
          id
        );
      } catch (err) {
        console.warn('SQLite update error:', err.message);
      }
    }

    return res.status(200).json({ success: true, product: updated });
  }

  // 4. DELETE PRODUCT (DELETE)
  if (req.method === 'DELETE') {
    const id = req.query ? Number(req.query.id) : null;
    if (db && id) {
      try {
        db.prepare('DELETE FROM products WHERE id = ?').run(id);
      } catch (err) {
        console.warn('SQLite delete error:', err.message);
      }
    }
    return res.status(200).json({ success: true, message: 'Product deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
