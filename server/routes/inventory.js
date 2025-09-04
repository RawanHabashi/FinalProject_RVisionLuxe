// ניהול מלאי
const express = require('express');
const router = express.Router();
const initDb = require('../config/dbSingleton');

// ----- STATs לשימוש ב-Inventory Snapshot -----
router.get('/stats', async (req, res) => {
  try {
    const db = await initDb();

    const [outRows] = await db.query(`
      SELECT COUNT(*) AS cnt FROM (
        SELECT (p.stock - IFNULL(r.reserved,0)) AS available
        FROM products p
        LEFT JOIN v_reserved_by_product r ON r.product_id = p.product_id
      ) t
      WHERE t.available <= 0
    `);

    const [lowRows] = await db.query(`
      SELECT COUNT(*) AS cnt FROM (
        SELECT p.reorder_level, (p.stock - IFNULL(r.reserved,0)) AS available
        FROM products p
        LEFT JOIN v_reserved_by_product r ON r.product_id = p.product_id
      ) t
      WHERE t.available > 0 AND t.available <= t.reorder_level
    `);

    const [resRows] = await db.query(`
      SELECT IFNULL(SUM(reserved),0) AS reservedTotal
      FROM v_reserved_by_product
    `);

    const [topLow] = await db.query(`
      SELECT p.product_id, p.name, p.reorder_level,
             IFNULL(r.reserved,0) AS reserved,
             p.stock,
             (p.stock - IFNULL(r.reserved,0)) AS available
      FROM products p
      LEFT JOIN v_reserved_by_product r ON r.product_id = p.product_id
      ORDER BY (p.stock - IFNULL(r.reserved,0)) ASC
      LIMIT 5
    `);

    res.json({
      outOfStock: outRows?.[0]?.cnt || 0,
      lowCount:   lowRows?.[0]?.cnt || 0,
      reservedTotal: resRows?.[0]?.reservedTotal || 0,
      topLow
    });
  } catch (err) {
    console.error('GET /api/inventory/stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// ----- רשימה לעמוד המלא (חיפוש/מיון/דפדוף) -----
router.get('/list', async (req, res) => {
  const db = await initDb();
  const { query = '', page = 1, pageSize = 20, sort = 'name', dir = 'asc' } = req.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  const allowedSort = new Set(['name','price','stock','reorder_level']);
  const orderBy = allowedSort.has(String(sort)) ? sort : 'name';
  const orderDir = String(dir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  try {
    const like = `%${query}%`;

    const [rows] = await db.query(
      `SELECT p.product_id, p.name, p.price, p.stock, p.reorder_level,
              c.category_name AS category,
              IFNULL(r.reserved, 0) AS reserved,
              (p.stock - IFNULL(r.reserved, 0)) AS available
       FROM products p
       LEFT JOIN categories c ON c.category_id = p.category_id
       LEFT JOIN v_reserved_by_product r ON r.product_id = p.product_id
       WHERE p.name LIKE ?
       ORDER BY ${orderBy} ${orderDir}
       LIMIT ? OFFSET ?`,
      [like, Number(pageSize), offset]
    );

    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) AS count FROM products p WHERE p.name LIKE ?`,
      [like]
    );

    res.json({ items: rows, total: count });
  } catch (err) {
    console.error('inventory/list error:', err);
    res.status(500).json({ error: 'Failed to load inventory' });
  }
});

// ----- היסטוריית תנועות למוצר -----
router.get('/movements/:product_id', async (req, res) => {
  const db = await initDb();
  try {
    const [rows] = await db.query(
      `SELECT id, qty_change, reason, note, created_at
       FROM stock_movements
       WHERE product_id = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.params.product_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('inventory/movements error:', err);
    res.status(500).json({ error: 'Failed to load movements' });
  }
});

// ----- התאמת מלאי (כבר היה אצלך) -----
router.post('/adjust', async (req, res) => {
  const db = await initDb(); // Connection יחיד (לפי ה-Singleton שלך)
  const { product_id, qty_change, reason, note } = req.body || {};

  if (!product_id || !qty_change || !reason) {
    return res.status(400).json({ error: 'product_id, qty_change, reason are required' });
  }
  const allowedReasons = new Set(['Purchase','Correction','Return','Damage']);
  if (!allowedReasons.has(reason)) {
    return res.status(400).json({ error: 'Invalid reason' });
  }

  try {
    await db.beginTransaction();

    // אם לא רוצים לרדת מתחת ל-0, אפשר להחליף ל: GREATEST(stock + ?, 0)
    await db.query('UPDATE products SET stock = stock + ? WHERE product_id = ?', [qty_change, product_id]);

    await db.query(
      'INSERT INTO stock_movements (product_id, qty_change, reason, note) VALUES (?,?,?,?)',
      [product_id, qty_change, reason, note || null]
    );

    await db.commit();
    res.json({ ok: true });
  } catch (err) {
    try { await db.rollback(); } catch {}
    console.error('inventory/adjust error:', err);
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
});

module.exports = router;
