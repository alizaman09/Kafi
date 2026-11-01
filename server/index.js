import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'kafi_super_secure_jwt_secret_2026_gulberg';
const PORT = process.env.PORT || 5000;

// Initialize tables & seed data
initDatabase();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Ensure persistent uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, 'prod-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max limit to preserve high quality
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, SVG, GIF) are allowed'));
    }
  }
});

// JWT Authentication Middleware for Protected Admin Routes
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

// -------------------------------------------------------------
// 1. AUTHENTICATION ROUTES
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email.toLowerCase().trim());
  if (!admin) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = bcrypt.compareSync(password, admin.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
  });
});

app.get('/api/auth/me', requireAdminAuth, (req, res) => {
  const admin = db.prepare('SELECT id, email, name, role, created_at FROM admins WHERE id = ?').get(req.admin.id);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  res.json({ user: admin });
});

// -------------------------------------------------------------
// 2. DASHBOARD KPI STATS & OVERVIEW
// -------------------------------------------------------------
app.get('/api/dashboard/stats', requireAdminAuth, (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const totalRevenueRow = db.prepare("SELECT SUM(total_amount) as sum FROM orders WHERE order_status != 'Cancelled'").get();
    const totalRevenue = totalRevenueRow.sum || 0;

    const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 10').get().count;

    const recentOrders = db.prepare(`
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o 
      ORDER BY o.created_at DESC 
      LIMIT 6
    `).all();

    const lowStockProducts = db.prepare(`
      SELECT id, name, sku, stock_quantity, status 
      FROM products 
      WHERE stock_quantity <= 10 
      ORDER BY stock_quantity ASC 
      LIMIT 5
    `).all();

    // Last 7 days sales aggregation
    const salesHistory = db.prepare(`
      SELECT date(created_at) as order_date, SUM(total_amount) as daily_revenue, COUNT(*) as order_count
      FROM orders
      WHERE order_status != 'Cancelled'
      GROUP BY date(created_at)
      ORDER BY order_date DESC
      LIMIT 7
    `).all();

    res.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      lowStockCount,
      recentOrders,
      lowStockProducts,
      salesHistory: salesHistory.reverse()
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
  }
});

// -------------------------------------------------------------
// 3. IMAGE UPLOAD
// -------------------------------------------------------------
app.post('/api/upload', requireAdminAuth, (req, res) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Upload processing error:', err.message);
      return res.status(400).json({ error: err.message || 'Image upload failed' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files were provided for upload' });
    }
    const urls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ success: true, urls });
  });
});

// -------------------------------------------------------------
// 4. CATEGORY MANAGEMENT
// -------------------------------------------------------------
app.get('/api/categories', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
    FROM categories c
    ORDER BY c.name ASC
  `).all();
  res.json(categories);
});

app.post('/api/categories', requireAdminAuth, (req, res) => {
  const { name, description, parent_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  try {
    const stmt = db.prepare(`
      INSERT INTO categories (name, slug, description, parent_id)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(name.trim(), slug, description || null, parent_id || null);
    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', requireAdminAuth, (req, res) => {
  const { name, description, parent_id } = req.body;
  const id = req.params.id;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  try {
    db.prepare(`
      UPDATE categories 
      SET name = ?, slug = ?, description = ?, parent_id = ?
      WHERE id = ?
    `).run(name.trim(), slug, description || null, parent_id || null, id);

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', requireAdminAuth, (req, res) => {
  const id = req.params.id;
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// -------------------------------------------------------------
// 5. PRODUCT MANAGEMENT
// -------------------------------------------------------------
app.get('/api/products', (req, res) => {
  const { search, category, status, featured, sort } = req.query;

  let query = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  if (category) {
    query += ` AND (c.slug = ? OR p.category_id = ?)`;
    params.push(category, category);
  }

  if (status) {
    query += ` AND p.status = ?`;
    params.push(status);
  }

  if (featured !== undefined) {
    query += ` AND p.is_featured = ?`;
    params.push(featured === 'true' || featured === '1' ? 1 : 0);
  }

  if (sort === 'price_asc') query += ` ORDER BY p.regular_price ASC`;
  else if (sort === 'price_desc') query += ` ORDER BY p.regular_price DESC`;
  else if (sort === 'stock_asc') query += ` ORDER BY p.stock_quantity ASC`;
  else if (sort === 'name_asc') query += ` ORDER BY p.name ASC`;
  else query += ` ORDER BY p.id ASC`;

  const rows = db.prepare(query).all(...params);

  // Parse JSON fields
  const products = rows.map(r => ({
    ...r,
    images: JSON.parse(r.images || '[]'),
    sizes: JSON.parse(r.sizes || '[]'),
    colors: JSON.parse(r.colors || '[]'),
    variants: JSON.parse(r.variants || '[]'),
  }));

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const row = db.prepare(`
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.id = ?
  `).get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Product not found' });

  res.json({
    ...row,
    images: JSON.parse(row.images || '[]'),
    sizes: JSON.parse(row.sizes || '[]'),
    colors: JSON.parse(row.colors || '[]'),
    variants: JSON.parse(row.variants || '[]'),
  });
});

app.post('/api/products', requireAdminAuth, (req, res) => {
  const {
    name, description, sku, regular_price, sale_price,
    category_id, images, sizes, colors, variants, stock_quantity, is_featured
  } = req.body;

  if (!name || regular_price === undefined || regular_price === '') {
    return res.status(400).json({ error: 'Menu item name and price are required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const itemSku = (sku && sku.trim()) ? sku.trim().toUpperCase() : ('KF-' + Date.now().toString().slice(-6));
  const stock = stock_quantity !== undefined && stock_quantity !== '' ? Number(stock_quantity) : 999;
  const status = 'in_stock';

  try {
    const stmt = db.prepare(`
      INSERT INTO products (
        name, slug, description, sku, regular_price, sale_price,
        category_id, images, sizes, colors, variants, stock_quantity,
        is_featured, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      slug,
      description || '',
      itemSku,
      Number(regular_price),
      sale_price ? Number(sale_price) : null,
      category_id ? Number(category_id) : null,
      JSON.stringify(images || []),
      JSON.stringify(sizes || []),
      JSON.stringify(colors || []),
      JSON.stringify(variants || []),
      stock,
      is_featured ? 1 : 0,
      status
    );

    // Record initial inventory log
    db.prepare(`
      INSERT INTO inventory_logs (product_id, product_name, change_amount, new_stock, reason)
      VALUES (?, ?, ?, ?, ?)
    `).run(result.lastInsertRowid, name.trim(), stock, stock, 'Initial stock entry');

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      ...created,
      images: JSON.parse(created.images || '[]'),
      sizes: JSON.parse(created.sizes || '[]'),
      colors: JSON.parse(created.colors || '[]'),
      variants: JSON.parse(created.variants || '[]')
    });
  } catch (err) {
    console.error('Error creating product:', err);
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Product SKU must be unique' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', requireAdminAuth, (req, res) => {
  const id = req.params.id;
  const {
    name, description, sku, regular_price, sale_price,
    category_id, images, sizes, colors, variants, stock_quantity, is_featured
  } = req.body;

  const current = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Product not found' });

  const stock = stock_quantity !== undefined && stock_quantity !== '' ? Number(stock_quantity) : (current.stock_quantity || 999);
  const status = 'in_stock';
  const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : current.slug;

  try {
    db.prepare(`
      UPDATE products SET
        name = ?, slug = ?, description = ?, sku = ?, regular_price = ?, sale_price = ?,
        category_id = ?, images = ?, sizes = ?, colors = ?, variants = ?,
        stock_quantity = ?, is_featured = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || current.name,
      slug,
      description !== undefined ? description : current.description,
      sku ? sku.trim().toUpperCase() : current.sku,
      regular_price !== undefined ? Number(regular_price) : current.regular_price,
      sale_price !== undefined ? (sale_price ? Number(sale_price) : null) : current.sale_price,
      category_id !== undefined ? (category_id ? Number(category_id) : null) : current.category_id,
      images ? JSON.stringify(images) : current.images,
      sizes ? JSON.stringify(sizes) : current.sizes,
      colors ? JSON.stringify(colors) : current.colors,
      variants ? JSON.stringify(variants) : current.variants,
      stock,
      is_featured !== undefined ? (is_featured ? 1 : 0) : current.is_featured,
      status,
      id
    );

    // If stock changed, log it
    if (stock !== current.stock_quantity) {
      const diff = stock - current.stock_quantity;
      db.prepare(`
        INSERT INTO inventory_logs (product_id, product_name, change_amount, new_stock, reason)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, name || current.name, diff, stock, 'Admin product update adjustment');
    }

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json({
      ...updated,
      images: JSON.parse(updated.images || '[]'),
      sizes: JSON.parse(updated.sizes || '[]'),
      colors: JSON.parse(updated.colors || '[]'),
      variants: JSON.parse(updated.variants || '[]')
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', requireAdminAuth, (req, res) => {
  const id = req.params.id;
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// -------------------------------------------------------------
// 6. ORDER MANAGEMENT & STOREFRONT CHECKOUT
// -------------------------------------------------------------
app.get('/api/orders', requireAdminAuth, (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (status && status !== 'all') {
    query += ' AND order_status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY id DESC';
  const orders = db.prepare(query).all(...params);

  // Attach items to each order
  const getItemStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const result = orders.map(ord => ({
    ...ord,
    items: getItemStmt.all(ord.id)
  }));

  res.json(result);
});

app.get('/api/orders/:id', requireAdminAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ ...order, items });
});

// Place order (Public storefront or Admin creation)
app.post('/api/orders', (req, res) => {
  const {
    customer_name, customer_email, customer_phone, shipping_address,
    city, payment_method, notes, items
  } = req.body;

  if (!customer_name || !customer_phone || !shipping_address || !items || items.length === 0) {
    return res.status(400).json({ error: 'Customer name, phone, address and cart items are required' });
  }

  // Calculate total
  let totalAmount = 0;
  items.forEach(item => {
    totalAmount += Number(item.price) * Number(item.quantity);
  });

  const orderNumber = 'KF-ORD-' + Math.floor(100000 + Math.random() * 900000);

  try {
    // 1. Insert or update customer
    let customer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(customer_phone.trim());
    if (customer) {
      db.prepare(`
        UPDATE customers 
        SET total_orders = total_orders + 1, total_spent = total_spent + ?, address = COALESCE(?, address), name = ?
        WHERE id = ?
      `).run(totalAmount, shipping_address, customer_name, customer.id);
    } else {
      db.prepare(`
        INSERT INTO customers (name, email, phone, address, city, total_orders, total_spent)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `).run(customer_name, customer_email || null, customer_phone.trim(), shipping_address, city || 'Lahore', totalAmount);
    }

    // 2. Insert order
    const insertOrderStmt = db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone,
        shipping_address, city, payment_method, payment_status,
        order_status, total_amount, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Unpaid', 'Pending', ?, ?)
    `);

    const orderResult = insertOrderStmt.run(
      orderNumber,
      customer_name,
      customer_email || null,
      customer_phone.trim(),
      shipping_address,
      city || 'Lahore',
      payment_method || 'Cash on Delivery',
      totalAmount,
      notes || null
    );

    const orderId = orderResult.lastInsertRowid;

    // 3. Insert items and update inventory automatically
    const insertItemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, price, quantity, selected_variant, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const updateProductStockStmt = db.prepare(`
      UPDATE products 
      SET stock_quantity = MAX(0, stock_quantity - ?),
          status = CASE 
            WHEN (stock_quantity - ?) <= 0 THEN 'out_of_stock'
            WHEN (stock_quantity - ?) <= 10 THEN 'low_stock'
            ELSE 'in_stock'
          END
      WHERE id = ?
    `);

    const logInventoryStmt = db.prepare(`
      INSERT INTO inventory_logs (product_id, product_name, change_amount, new_stock, reason, reference_order_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      const lineTotal = Number(item.price) * Number(item.quantity);
      insertItemStmt.run(
        orderId,
        item.product_id || null,
        item.name,
        Number(item.price),
        Number(item.quantity),
        item.variant || 'Standard',
        lineTotal
      );

      // Deduct stock if product_id exists
      if (item.product_id) {
        const prod = db.prepare('SELECT id, name, stock_quantity FROM products WHERE id = ?').get(item.product_id);
        if (prod) {
          const qty = Number(item.quantity);
          updateProductStockStmt.run(qty, qty, qty, prod.id);
          const updatedProd = db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(prod.id);
          logInventoryStmt.run(
            prod.id,
            prod.name,
            -qty,
            updatedProd.stock_quantity,
            `Order #${orderNumber} placed`,
            orderId
          );
        }
      }
    }

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const createdItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: { ...createdOrder, items: createdItems }
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// Update order status (Pending -> Processing -> Shipped -> Delivered -> Cancelled)
app.patch('/api/orders/:id/status', requireAdminAuth, (req, res) => {
  const { order_status, payment_status } = req.body;
  const id = req.params.id;

  const current = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Order not found' });

  try {
    const newStatus = order_status || current.order_status;
    const newPayStatus = payment_status || current.payment_status;

    // Handle stock restoration if order is being Cancelled
    if (newStatus === 'Cancelled' && current.order_status !== 'Cancelled') {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
      for (const item of items) {
        if (item.product_id) {
          db.prepare(`
            UPDATE products 
            SET stock_quantity = stock_quantity + ?,
                status = CASE 
                  WHEN (stock_quantity + ?) <= 0 THEN 'out_of_stock'
                  WHEN (stock_quantity + ?) <= 10 THEN 'low_stock'
                  ELSE 'in_stock'
                END
            WHERE id = ?
          `).run(item.quantity, item.quantity, item.quantity, item.product_id);

          const prod = db.prepare('SELECT stock_quantity, name FROM products WHERE id = ?').get(item.product_id);
          db.prepare(`
            INSERT INTO inventory_logs (product_id, product_name, change_amount, new_stock, reason, reference_order_id)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(item.product_id, prod.name, item.quantity, prod.stock_quantity, `Restored from Cancelled Order #${current.order_number}`, id);
        }
      }
    }

    db.prepare(`
      UPDATE orders 
      SET order_status = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, newPayStatus, id);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
    res.json({ ...updated, items });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// -------------------------------------------------------------
// 7. INVENTORY MANAGEMENT
// -------------------------------------------------------------
app.get('/api/inventory', requireAdminAuth, (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT id, name, sku, stock_quantity, status, regular_price, updated_at
    FROM products
    WHERE 1=1
  `;
  const params = [];
  if (status === 'low_stock') {
    query += ' AND stock_quantity <= 10 AND stock_quantity > 0';
  } else if (status === 'out_of_stock') {
    query += ' AND stock_quantity <= 0';
  }
  query += ' ORDER BY stock_quantity ASC';

  const inventory = db.prepare(query).all(...params);
  res.json(inventory);
});

app.post('/api/inventory/adjust', requireAdminAuth, (req, res) => {
  const { product_id, change_amount, reason } = req.body;
  if (!product_id || change_amount === undefined) {
    return res.status(400).json({ error: 'Product ID and change amount are required' });
  }

  const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });

  const newStock = Math.max(0, prod.stock_quantity + Number(change_amount));
  const newStatus = newStock <= 0 ? 'out_of_stock' : (newStock <= 10 ? 'low_stock' : 'in_stock');

  try {
    db.prepare(`
      UPDATE products 
      SET stock_quantity = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStock, newStatus, product_id);

    db.prepare(`
      INSERT INTO inventory_logs (product_id, product_name, change_amount, new_stock, reason)
      VALUES (?, ?, ?, ?, ?)
    `).run(prod.id, prod.name, Number(change_amount), newStock, reason || 'Manual Admin Adjustment');

    res.json({ success: true, product_id, new_stock: newStock, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to adjust inventory' });
  }
});

app.get('/api/inventory/logs', requireAdminAuth, (req, res) => {
  const logs = db.prepare(`
    SELECT * FROM inventory_logs 
    ORDER BY id DESC 
    LIMIT 50
  `).all();
  res.json(logs);
});

// -------------------------------------------------------------
// 8. CUSTOMER MANAGEMENT
// -------------------------------------------------------------
app.get('/api/customers', requireAdminAuth, (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM customers WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR city LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  query += ' ORDER BY id DESC';
  const customers = db.prepare(query).all(...params);
  res.json(customers);
});

app.get('/api/customers/:id', requireAdminAuth, (req, res) => {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  // Get orders by this customer phone or email
  const orders = db.prepare(`
    SELECT * FROM orders 
    WHERE customer_phone = ? OR (customer_email IS NOT NULL AND customer_email = ?)
    ORDER BY id DESC
  `).all(customer.phone, customer.email || '');

  res.json({ ...customer, orders });
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KAFI Admin & Storefront API Server running on http://0.0.0.0:${PORT}`);
});

