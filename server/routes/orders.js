const express = require('express');
const router = express.Router();
const initDb = require('../config/dbSingleton');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// ---- גופנים (תומכים ב־₪) ----
const fontsDir     = path.join(__dirname, '../fonts');
const FONT_REGULAR = path.join(fontsDir, 'NotoSansHebrew-Regular.ttf');
const FONT_BOLD    = path.join(fontsDir, 'NotoSansHebrew-Bold.ttf');

// ---- סטטוסים מותרים ----
const ALLOWED_STATUSES = [
  'Pending',
  'Processing',
  'Ready for Shipment',
  'In Transit',
  'Delivered'
];

/* ============================================================================
   Orders API
   ==========================================================================*/

// ✅ שליפת כל ההזמנות של משתמש מסוים לפי user_id (עם פריטים)
router.get('/user/:user_id', async (req, res) => {
  try {
    const db = await initDb();
    const { user_id } = req.params;

    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC',
      [user_id]
    );
    if (!orders.length) return res.json([]);

    const orderIds = orders.map(o => o.order_id);
    const [itemsRows] = await db.query(
      `
      SELECT 
        oi.order_id,
        oi.product_id,
        oi.quantity,
        p.name  AS product_name,
        p.price AS product_price
      FROM order_items oi
      JOIN products p ON p.product_id = oi.product_id
      WHERE oi.order_id IN (?)
      `,
      [orderIds]
    );

    const itemsByOrder = {};
    for (const r of itemsRows) {
      if (!itemsByOrder[r.order_id]) itemsByOrder[r.order_id] = [];
      itemsByOrder[r.order_id].push({
        product_id: r.product_id,
        name: r.product_name,
        price: Number(r.product_price) || 0,
        quantity: Number(r.quantity) || 1,
      });
    }

    const enriched = orders.map(o => ({
      ...o,
      items: itemsByOrder[o.order_id] || [],
    }));

    res.json(enriched);
  } catch (err) {
    console.error('❌ Failed to fetch user orders with items:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ✅ רשימת הזמנות לניהול אדמין (חיפוש/סינון/דפדוף)
router.get('/', async (req, res) => {
  try {
    const db = await initDb();
    const { status, q, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const perPage = Math.max(1, Number(limit) || 10);
    const offset  = (pageNum - 1) * perPage;

    let where = 'WHERE 1=1';
    const params = [];

    if (status) {
      where += ' AND o.status = ?';
      params.push(status);
    }
    if (q) {
      // CAST ל־CHAR כדי לאפשר LIKE על order_id מספרי
      where += ' AND (u.email LIKE ? OR u.name LIKE ? OR CAST(o.order_id AS CHAR) LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const listSql = `
      SELECT
        o.order_id,
        o.user_id,
        o.order_date,
        o.total_amount,
        o.status,
        u.name  AS customer_name,
        u.email AS customer_email,
        (SELECT COALESCE(SUM(oi.quantity),0)
           FROM order_items oi
          WHERE oi.order_id = o.order_id) AS items_count
      FROM orders o
      JOIN users u ON u.user_id = o.user_id
      ${where}
      ORDER BY o.order_date DESC
      LIMIT ? OFFSET ?;
    `;

    const countSql = `
      SELECT COUNT(*) AS cnt
      FROM orders o
      JOIN users u ON u.user_id = o.user_id
      ${where};
    `;

    const [rows]      = await db.query(listSql,  [...params, perPage, offset]);
    const [countRows] = await db.query(countSql, params);

    res.json({ data: rows, total: countRows[0].cnt, page: pageNum, limit: perPage });
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ✅ הפקת חשבונית PDF להזמנה
router.get('/invoice/:orderId', async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const db = await initDb();

    // 1) שליפת הזמנה
    const [orderRows] = await db.query(
      'SELECT * FROM orders WHERE order_id = ?',
      [orderId]
    );
    if (orderRows.length === 0) return res.status(404).send('Order not found');
    const order = orderRows[0];

    // 2) שליפת פריטים
    const [products] = await db.query(`
      SELECT p.name, p.price, oi.quantity
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?
    `, [orderId]);

    // 3) קבועים וחישובים
    const VAT_RATE = 0.18; // 18% מע"מ
    const SHIPPING = 30;   // עלות משלוח

    let subtotal = 0;
    products.forEach(p => {
      const price = Number(p.price) || 0;
      const qty   = Number(p.quantity) || 1;
      subtotal += price * qty;
    });
    const vatAmount  = Number((subtotal * VAT_RATE).toFixed(2));
    const finalTotal = Number((subtotal + vatAmount + SHIPPING).toFixed(2));

    // 4) יצירת PDF
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    let canUseShekel = true;
    try {
      if (fs.existsSync(FONT_REGULAR)) {
        doc.font(FONT_REGULAR);
      } else {
        canUseShekel = false;
      }
    } catch {
      canUseShekel = false;
    }
    const CURRENCY = canUseShekel ? '₪' : 'NIS';

    // כותרת
    try { if (fs.existsSync(FONT_BOLD)) doc.font(FONT_BOLD); } catch {}
    doc.fontSize(20).fillColor('#8B4513')
       .text(`Invoice for Order #${order.order_id}`, { align: 'center' })
       .moveDown(1);

    // לוגו
    const logoPath = path.join(__dirname, '../images/Rvision Luxe-logo.jpg');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 75, doc.y, { width: 120 });
      doc.moveDown(3);
    } else {
      doc.moveDown(1.5);
    }

    // חזרה לגופן רגיל
    try { if (fs.existsSync(FONT_REGULAR)) doc.font(FONT_REGULAR); } catch {}

    // פרטי הזמנה
    doc.fontSize(12).fillColor('black')
       .text(`Date: ${new Date(order.order_date).toLocaleString()}`)
       .text(`Status: ${order.status}`)
       .moveDown(1);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);

    // פריטים
    doc.fontSize(14).text('Items:', { underline: true }).moveDown(0.5);

    products.forEach((product, i) => {
      const price    = Number(product.price) || 0;
      const quantity = Number(product.quantity) || 1;
      const lineSum  = price * quantity;

      doc.fontSize(12)
        .text(`${i + 1}. ${product.name}`, { continued: true })
        .text(`${price.toFixed(2)}${CURRENCY} x ${quantity} = ${lineSum.toFixed(2)}${CURRENCY}`, {
          align: 'right'
        });
    });

    // סיכום
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

    const right = (label, value, bold = false) => {
      if (bold && fs.existsSync(FONT_BOLD)) doc.font(FONT_BOLD);
      else if (fs.existsSync(FONT_REGULAR)) doc.font(FONT_REGULAR);

      doc.fontSize(bold ? 14 : 12)
         .fillColor(bold ? '#8B0000' : 'black')
         .text(`${label}: ${value.toFixed(2)}${CURRENCY}`, { align: 'right' });
    };

    right('Subtotal', subtotal);
    right(`VAT (${(VAT_RATE * 100).toFixed(0)}%)`, vatAmount);
    right('Shipping', SHIPPING);
    doc.moveDown(0.5);
    right('Final Total', finalTotal, true);

    doc.end();
  } catch (err) {
    console.error('❌ Error generating invoice:', err);
    res.status(500).send('Error generating invoice');
  }
});

// ✅ שליפת הזמנה בודדת לפי order_id
router.get('/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    const db = await initDb();
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(`❌ Error fetching order ${orderId}:`, err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ✅ עדכון סטטוס הזמנה
// PATCH /api/orders/:id/status   body: { status: "In Transit" }
router.patch('/:id/status', async (req, res) => {
  try {
    const db = await initDb();
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value', allowed: ALLOWED_STATUSES });
    }

    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [status, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });

    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ✅ יצירת הזמנה חדשה (לשימוש פנימי/בדיקות)
router.post('/', async (req, res) => {
  try {
    const db = await initDb();
    const { user_id, order_date, total_amount, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO orders (user_id, order_date, total_amount, status) VALUES (?, ?, ?, ?)',
      [user_id, order_date, total_amount, status]
    );
    res.json({ message: 'Order added successfully', order_id: result.insertId });
  } catch (err) {
    console.error('❌ Error adding order:', err);
    res.status(500).json({ error: 'Failed to add order' });
  }
});


module.exports = router;
