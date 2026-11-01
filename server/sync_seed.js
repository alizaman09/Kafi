import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new DatabaseSync(path.join(__dirname, '../data/kafi.db'));

// Map of the 9 signature coffee items matching user's original cards & transparent cups
const nineOriginals = [
  { id: 1, name: 'Caramel Macchiato', sku: 'KF-MAC-01', regular_price: 150, desc: 'A caramel macchiato is a layered espresso drink with steamed milk and caramel drizzle.', img: '/assets/cups/cup_clean_1.png' },
  { id: 2, name: 'Americano', sku: 'KF-AME-02', regular_price: 130, desc: 'Single coffee drink made by diluting espresso with hot water, giving it a smooth, bold flavor.', img: '/assets/cups/cup_clean_2.png' },
  { id: 3, name: 'Cappuccino', sku: 'KF-CAP-03', regular_price: 200, desc: 'A cappuccino is an espresso-based drink with equal parts espresso, steamed milk, and milk foam.', img: '/assets/cups/cup_clean_3.png' },
  { id: 4, name: 'Flat White', sku: 'KF-FLA-04', regular_price: 125, desc: 'Creamy espresso with microfoam.', img: '/assets/cups/cup_clean_4.png' },
  { id: 5, name: 'Espresso', sku: 'KF-ESP-05', regular_price: 160, desc: 'Espresso stained with a small amount of milk.', img: '/assets/cups/cup_clean_5.png' },
  { id: 6, name: 'Café Mocha', sku: 'KF-MOC-06', regular_price: 140, desc: 'Coffee with chocolate and milk.', img: '/assets/cups/cup_clean_6.png' },
  { id: 7, name: 'Cold Brew', sku: 'KF-COL-07', regular_price: 145, desc: 'Slowly steeped coffee served chilled.', img: '/assets/cups/cup_clean_7.png' },
  { id: 8, name: 'Ristretto', sku: 'KF-RIS-08', regular_price: 150, desc: 'A shorter, more concentrated espresso.', img: '/assets/cups/cup_clean_8.png' },
  { id: 9, name: 'Café au Lait', sku: 'KF-LAI-09', regular_price: 130, desc: 'Brewed coffee with steamed milk.', img: '/assets/cups/cup_clean_9.png' }
];

// Find any extra user products like id 8 (ewwwwwwwwwwwwwwwwwwa)
const existing = db.prepare('SELECT * FROM products').all();
const userCustomProducts = existing.filter(p => !nineOriginals.some(o => o.sku === p.sku));

// Re-insert clean 9 items
db.exec('DELETE FROM products');
db.exec("DELETE FROM sqlite_sequence WHERE name='products'");

const insertStmt = db.prepare(`
  INSERT INTO products (
    name, slug, description, sku, regular_price, sale_price, category_id,
    images, sizes, colors, variants, stock_quantity, is_featured, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const o of nineOriginals) {
  insertStmt.run(
    o.name,
    o.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    o.desc,
    o.sku,
    o.regular_price,
    null,
    1,
    JSON.stringify([o.img]),
    JSON.stringify(['Regular', 'Large']),
    JSON.stringify([]),
    JSON.stringify([]),
    30,
    1,
    'in_stock'
  );
}

// Re-insert user custom products (including ewwwwwwwwwwwwwwwwwwa!) with a nice fallback cup image if missing
for (const u of userCustomProducts) {
  let images = [];
  try {
    images = JSON.parse(u.images || '[]');
  } catch (e) {
    images = [];
  }
  if (!images || images.length === 0 || !images[0].startsWith('/')) {
    images = ['/assets/cups/cup_clean_1.png'];
  }
  insertStmt.run(
    u.name,
    u.slug || u.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    u.description || 'Specialty item from KAFI Bakery & Roastery.',
    u.sku || 'KF-' + Math.floor(100 + Math.random() * 900),
    u.regular_price || 400,
    u.sale_price || null,
    u.category_id || 1,
    JSON.stringify(images),
    u.sizes || '[]',
    u.colors || '[]',
    u.variants || '[]',
    u.stock_quantity || 1,
    1,
    u.status || 'in_stock'
  );
}

console.log('Total products in database now:', db.prepare('SELECT COUNT(*) as count FROM products').get().count);
const all = db.prepare('SELECT id, name, sku, regular_price, images FROM products').all();
console.log(all);

