import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'kafi.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  // Admins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      parent_id INTEGER DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      sku TEXT UNIQUE NOT NULL,
      regular_price REAL NOT NULL,
      sale_price REAL DEFAULT NULL,
      category_id INTEGER,
      images TEXT DEFAULT '[]',
      sizes TEXT DEFAULT '[]',
      colors TEXT DEFAULT '[]',
      variants TEXT DEFAULT '[]',
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      status TEXT DEFAULT 'in_stock',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  // Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      address TEXT,
      city TEXT DEFAULT 'Lahore',
      total_orders INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      city TEXT DEFAULT 'Lahore',
      payment_method TEXT DEFAULT 'Cash on Delivery',
      payment_status TEXT DEFAULT 'Unpaid',
      order_status TEXT DEFAULT 'Pending',
      total_amount REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Order items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      selected_variant TEXT,
      total REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  // Inventory logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      change_amount INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      reason TEXT NOT NULL,
      reference_order_id INTEGER DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  // 1. Seed Default Admin
  const adminCheck = db.prepare('SELECT id FROM admins WHERE email = ?').get('admin@kafi.pk');
  if (!adminCheck) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('admin123456', salt);
    db.prepare(`
      INSERT INTO admins (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin@kafi.pk', passwordHash, 'KAFI Super Admin', 'super_admin');
    console.log('Seeded default admin: admin@kafi.pk / admin123456');
  }

  // 2. Seed Categories
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (name, slug, description, parent_id)
      VALUES (?, ?, ?, ?)
    `);

    insertCat.run('Hot Coffee', 'hot-coffee', 'Artisanal hot espresso and milk-based brews', null);
    insertCat.run('Cold Brew & Iced', 'cold-brew-iced', 'Slow-steeped and refreshing iced coffee drinks', null);
    insertCat.run('Specialty Beans', 'specialty-beans', 'Single origin roasted coffee beans and blends', null);
    insertCat.run('Bakery & Treats', 'bakery-treats', 'Freshly baked artisan pastries and desserts', null);
    console.log('Seeded default categories');
  }

  // 3. Seed Products
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (productCount === 0) {
    const categories = db.prepare('SELECT id, slug FROM categories').all();
    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c.id; });

    const insertProd = db.prepare(`
      INSERT INTO products (
        name, slug, description, sku, regular_price, sale_price, category_id,
        images, sizes, colors, variants, stock_quantity, is_featured, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialProducts = [
      {
        name: 'Spanish Latte',
        slug: 'spanish-latte',
        description: 'Smooth double espresso combined with condensed milk and steamed textured milk for rich sweetness.',
        sku: 'KF-LAT-001',
        regular_price: 750,
        sale_price: 699,
        category_id: catMap['hot-coffee'] || 1,
        images: JSON.stringify(['/images/spanish-latte.png', '/images/product-cup.png']),
        sizes: JSON.stringify(['Regular (8oz)', 'Large (12oz)']),
        colors: JSON.stringify(['Warm Cream']),
        variants: JSON.stringify([
          { name: 'Regular (8oz)', price: 699, stock: 25 },
          { name: 'Large (12oz)', price: 799, stock: 20 }
        ]),
        stock_quantity: 45,
        is_featured: 1,
        status: 'in_stock'
      },
      {
        name: 'Iced Americano',
        slug: 'iced-americano',
        description: 'Signature double espresso shots poured over clear ice and chilled filtered water. Bold and crisp.',
        sku: 'KF-AME-002',
        regular_price: 600,
        sale_price: null,
        category_id: catMap['cold-brew-iced'] || 2,
        images: JSON.stringify(['/images/iced-americano.png']),
        sizes: JSON.stringify(['12oz', '16oz']),
        colors: JSON.stringify([]),
        variants: JSON.stringify([
          { name: '12oz', price: 600, stock: 20 },
          { name: '16oz', price: 680, stock: 18 }
        ]),
        stock_quantity: 38,
        is_featured: 1,
        status: 'in_stock'
      },
      {
        name: 'Caramel Macchiato',
        slug: 'caramel-macchiato',
        description: 'Velvety steamed milk marked with espresso and layered with homemade Madagascar vanilla and salted caramel.',
        sku: 'KF-MAC-003',
        regular_price: 850,
        sale_price: 790,
        category_id: catMap['hot-coffee'] || 1,
        images: JSON.stringify(['/images/caramel-macchiato.png']),
        sizes: JSON.stringify(['Regular', 'Large']),
        colors: JSON.stringify([]),
        variants: JSON.stringify([
          { name: 'Regular', price: 790, stock: 15 },
          { name: 'Large', price: 890, stock: 9 }
        ]),
        stock_quantity: 24,
        is_featured: 1,
        status: 'in_stock'
      },
      {
        name: 'Cortado',
        slug: 'cortado',
        description: 'Equal parts intense espresso and warm textured milk to cut the acidity without masking the bean profile.',
        sku: 'KF-COR-004',
        regular_price: 650,
        sale_price: null,
        category_id: catMap['hot-coffee'] || 1,
        images: JSON.stringify(['/images/cortado.png']),
        sizes: JSON.stringify(['4oz']),
        colors: JSON.stringify([]),
        variants: JSON.stringify([
          { name: 'Standard 4oz', price: 650, stock: 18 }
        ]),
        stock_quantity: 18,
        is_featured: 1,
        status: 'in_stock'
      },
      {
        name: 'Cold Brew Reserve (18-Hour)',
        slug: 'cold-brew-reserve',
        description: 'Slow-dripped for 18 hours using single-origin Ethiopian beans. Ultra smooth chocolate and berry notes.',
        sku: 'KF-COLD-005',
        regular_price: 850,
        sale_price: 750,
        category_id: catMap['cold-brew-iced'] || 2,
        images: JSON.stringify(['/images/cold-brew.png']),
        sizes: JSON.stringify(['300ml Bottle']),
        colors: JSON.stringify([]),
        variants: JSON.stringify([
          { name: 'Glass Bottle (300ml)', price: 750, stock: 8 }
        ]),
        stock_quantity: 8,
        is_featured: 1,
        status: 'low_stock'
      },
      {
        name: 'Gulberg Signature Whole Beans (250g)',
        slug: 'gulberg-signature-beans-250g',
        description: 'Medium roast blend of high-altitude Arabica with tasting notes of hazelnut, honey, and dark cocoa.',
        sku: 'KF-BN-006',
        regular_price: 2100,
        sale_price: 1950,
        category_id: catMap['specialty-beans'] || 3,
        images: JSON.stringify(['/images/beans-bag.png']),
        sizes: JSON.stringify(['Whole Bean', 'Fine Espresso Grind', 'French Press']),
        colors: JSON.stringify([]),
        variants: JSON.stringify([
          { name: 'Whole Bean (250g)', price: 1950, stock: 30 },
          { name: 'Fine Espresso Grind (250g)', price: 1950, stock: 20 }
        ]),
        stock_quantity: 50,
        is_featured: 1,
        status: 'in_stock'
      },
      {
        name: 'Butter Almond Croissant',
        slug: 'butter-almond-croissant',
        description: 'Twice-baked butter croissant loaded with almond crème frangipane and toasted sliced almonds.',
        sku: 'KF-BAK-007',
        regular_price: 550,
        sale_price: null,
        category_id: catMap['bakery-treats'] || 4,
        images: JSON.stringify(['/images/croissant.png']),
        sizes: JSON.stringify(['Single']),
        colors: JSON.stringify([]),
        variants: JSON.stringify([]),
        stock_quantity: 3,
        is_featured: 0,
        status: 'low_stock'
      }
    ];

    for (const prod of initialProducts) {
      insertProd.run(
        prod.name,
        prod.slug,
        prod.description,
        prod.sku,
        prod.regular_price,
        prod.sale_price,
        prod.category_id,
        prod.images,
        prod.sizes,
        prod.colors,
        prod.variants,
        prod.stock_quantity,
        prod.is_featured,
        prod.status
      );
    }
    console.log('Seeded initial products');
  }

  // 4. Seed sample customers & orders for immediate dashboard visualization
  const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  if (customerCount === 0) {
    const insertCust = db.prepare(`
      INSERT INTO customers (name, email, phone, address, city, total_orders, total_spent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertCust.run('Hamza Tariq', 'hamza@example.com', '+92 300 1234567', 'House 42, Block L, Gulberg III', 'Lahore', 3, 4950);
    insertCust.run('Ayesha Khan', 'ayesha.k@example.com', '+92 321 9876543', 'Plaza 14, Main Boulevard', 'Lahore', 1, 1499);
    insertCust.run('Bilal Ahmed', 'bilal.a@example.com', '+92 333 4567890', 'Sector Y, DHA Phase 3', 'Lahore', 2, 2700);

    // Orders
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone,
        shipping_address, city, payment_method, payment_status, order_status,
        total_amount, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, price, quantity, selected_variant, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const o1 = insertOrder.run(
      'KF-ORD-1001', 'Hamza Tariq', 'hamza@example.com', '+92 300 1234567',
      'House 42, Block L, Gulberg III', 'Lahore', 'Cash on Delivery', 'Paid', 'Delivered',
      2098, 'Leave at front gate', '2026-10-29 14:20:00'
    );
    insertItem.run(o1.lastInsertRowid, 1, 'Spanish Latte', 699, 2, 'Large (12oz)', 1398);
    insertItem.run(o1.lastInsertRowid, 4, 'Cortado', 650, 1, 'Standard 4oz', 650);

    const o2 = insertOrder.run(
      'KF-ORD-1002', 'Ayesha Khan', 'ayesha.k@example.com', '+92 321 9876543',
      'Plaza 14, Main Boulevard', 'Lahore', 'Direct Bank Transfer / JazzCash', 'Paid', 'Processing',
      1499, 'Call upon arrival', '2026-10-31 16:45:00'
    );
    insertItem.run(o2.lastInsertRowid, 5, 'Cold Brew Reserve (18-Hour)', 750, 2, 'Glass Bottle (300ml)', 1500);

    const o3 = insertOrder.run(
      'KF-ORD-1003', 'Bilal Ahmed', 'bilal.a@example.com', '+92 333 4567890',
      'Sector Y, DHA Phase 3', 'Lahore', 'Cash on Delivery', 'Unpaid', 'Pending',
      2650, 'Extra hot please', '2026-11-01 09:15:00'
    );
    insertItem.run(o3.lastInsertRowid, 6, 'Gulberg Signature Whole Beans (250g)', 1950, 1, 'Whole Bean (250g)', 1950);
    insertItem.run(o3.lastInsertRowid, 4, 'Cortado', 650, 1, 'Standard 4oz', 650);

    console.log('Seeded sample orders & customers');
  }
}

export default db;

