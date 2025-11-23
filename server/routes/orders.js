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
// --- VAT helper: read % from settings (returns integer like 18) ---
async function getCurrentVatPercent(db) {
  try {
    const [rows] = await db.query(
      'SELECT `value` FROM settings WHERE `key`="vat_percent" LIMIT 1'
    );
    const n = Number(rows?.[0]?.value);
    return Number.isFinite(n) ? n : 18;
  } catch {
    return 18;
  }
}

// 🔢 Helper to compute totals when product prices are tax-inclusive
// מחזיר חישוב מלא כשמחירי המוצרים כוללים מע״מ
function computeTotalsTaxIncluded({ subtotalInclVat, vatPercent, shipping }) {
  const vp = Number(vatPercent) || 0;
  const ship = Number(shipping) || 0;

  // רכיב המע״מ מתוך מחיר כולל (לדוגמה 18% ⇒ 18/118)
  const vatAmount = Number(((subtotalInclVat * vp) / (100 + vp)).toFixed(2));

  // נטו לפני מע״מ (מוצרים בלבד)
  const netBeforeVat = Number((subtotalInclVat - vatAmount).toFixed(2));

  // סה״כ סופי ללקוח (מוצרים כולל מע״מ + משלוח) — לא מוסיפים מע״מ שוב
  const finalTotal = Number((subtotalInclVat + ship).toFixed(2));

  return {
    products_total_incl_vat: Number(subtotalInclVat.toFixed(2)),
    products_total_net: netBeforeVat,
    vat_percent: vp,
    vat_amount: vatAmount,
    shipping: ship,
    final_total: finalTotal,
  };
}

   //Orders API
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

    // שליפת כל הפריטים לכל ההזמנות בשאילתה אחת
    const [itemsRows] = await db.query(`
      SELECT 
        oi.order_id,
        oi.product_id,
        oi.quantity,
        p.name  AS product_name,
        p.price AS product_price
      FROM order_items oi
      JOIN products p ON p.product_id = oi.product_id
      WHERE oi.order_id IN (?)
    `, [orderIds]);

    // קיבוץ פריטים לפי הזמנה
    const itemsByOrder = {};
    for (const r of itemsRows) {
      if (!itemsByOrder[r.order_id]) itemsByOrder[r.order_id] = [];
      itemsByOrder[r.order_id].push({
        product_id: r.product_id,
        name: r.product_name,
        price: Number(r.product_price) || 0, // כולל מע״מ
        quantity: Number(r.quantity) || 1,
      });
    }

    // העשרה עם totals לכל הזמנה
    const enriched = [];
    for (const o of orders) {
      const items = itemsByOrder[o.order_id] || [];

      // subtotal של מוצרים (מחירים כוללים מע״מ)
      let subtotal = 0;
      for (const it of items) {
        subtotal += (Number(it.price) || 0) * (Number(it.quantity) || 1);
      }

      // אחוז מע״מ ומשלוח
      const vatPercent = (o.vat_percent != null)
        ? Number(o.vat_percent)
        : await getCurrentVatPercent(db);
      const SHIPPING = (o.shipping != null) ? Number(o.shipping) : 30;

      const totals = computeTotalsTaxIncluded({
        subtotalInclVat: subtotal,
        vatPercent,
        shipping: SHIPPING,
      });

      enriched.push({
        ...o,
        items,
        totals, // ← products_total_incl_vat, vat_amount, shipping, final_total, products_total_net, vat_percent
      });
    }

    res.json(enriched);
  } catch (err) {
    console.error('❌ Failed to fetch user orders with items:', err);
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
    // 3) חישובים דינמיים לפי DB
//א. מע"מ   (orders.vat_percent) – נשתמש בו,
let vatPercent;
if (order.vat_percent != null) {
  vatPercent = Number(order.vat_percent);      
} else {
  vatPercent = await getCurrentVatPercent(db); 
}
// ב. משלוח:30
const SHIPPING = order.shipping != null ? Number(order.shipping) : 30;
// ג. subtotal מהפריטים (מחיר כולל מע"מ)
let subtotal = 0;
products.forEach(p => {
  const price = Number(p.price) || 0;
  const qty   = Number(p.quantity) || 1;
  subtotal += price * qty;
});
// 🧮 compute totals with tax-inclusive prices
const totals = computeTotalsTaxIncluded({
  subtotalInclVat: subtotal,
  vatPercent,
  shipping: SHIPPING,
});
const vatAmount  = totals.vat_amount;
const finalTotal = totals.final_total;

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
    right('Products Total (incl. VAT)', totals.products_total_incl_vat);
    right(`VAT (${totals.vat_percent}%)`, totals.vat_amount);
    right('Shipping', totals.shipping);
    doc.moveDown(0.5);
    right('Products Total (net, before VAT)', totals.products_total_net);
    right('Final Total', totals.final_total, true);
    doc.end();
  } catch (err) {
    console.error('❌ Error generating invoice:', err);
    res.status(500).send('Error generating invoice');
  }
});

// ✅ כל ההזמנות לממשק המנהל (כולל מספר פריטים בכל הזמנה!)
router.get('/', async (req, res) => {
  try {
    const db = await initDb();

    const {
      q = '',
      status = '',
      page = 1,
      limit = 100000,
    } = req.query;

    const offset = (page - 1) * limit;

    let where = '1=1';
    const params = [];

    const normalizedStatus = String(status).trim();
    if (
      normalizedStatus &&
      normalizedStatus !== 'All' &&
      normalizedStatus !== 'All statuses'
    ) {
      where += ' AND o.status = ?';
      params.push(normalizedStatus);
    }

    if (q) {
      where += ' AND (u.name LIKE ? OR u.email LIKE ? OR o.order_id LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    // ⭐ נוסיף LEFT JOIN ל־order_items ונחשב את סך הכמויות
    const [rows] = await db.query(
      `
      SELECT
        o.order_id,
        o.user_id,
        o.order_date,
        o.total_amount,
        o.status,
        o.payment_method,
        u.name  AS customer_name,
        u.email AS customer_email,
        COALESCE(SUM(oi.quantity), 0) AS items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.order_id
      WHERE ${where}
      GROUP BY 
        o.order_id, o.user_id, o.order_date, o.total_amount,
        o.status, o.payment_method, u.name, u.email
      ORDER BY o.order_date DESC
      LIMIT ? OFFSET ?
      `,
      [...params, Number(limit), Number(offset)]
    );

    res.json({ orders: rows });

  } catch (err) {
    console.error('❌ Error fetching admin orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

 
// ✅ שליפת הזמנה בודדת לפי order_id
router.get('/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    const db = await initDb();

    // fetch order
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    // fetch items (with prices)
    const [products] = await db.query(`
      SELECT p.product_id, p.name, p.price, oi.quantity
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?
    `, [orderId]);

    // vat + shipping from DB/settings
    const vatPercent = order.vat_percent != null
      ? Number(order.vat_percent)
      : await getCurrentVatPercent(db);
    const SHIPPING = order.shipping != null ? Number(order.shipping) : 30;

    // subtotal (prices are tax-inclusive)
    let subtotal = 0;
    products.forEach(p => {
      const price = Number(p.price) || 0;
      const qty   = Number(p.quantity) || 1;
      subtotal += price * qty;
    });

    const totals = computeTotalsTaxIncluded({
      subtotalInclVat: subtotal,
      vatPercent,
      shipping: SHIPPING,
    });

    // return enriched order
    res.json({
      ...order,
      items: products.map(p => ({
        product_id: p.product_id,
        name: p.name,
        price: Number(p.price) || 0,   // includes VAT
        quantity: Number(p.quantity) || 1,
      })),
      totals, // ← כאן הפרונט יקבל הכל מוכן לתצוגה
    });
  } catch (err) {
    console.error(`❌ Error fetching order ${orderId}:`, err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ✅ עדכון סטטוס הזמנה
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
    const { user_id, order_date, total_amount, status,payment_method } = req.body;
    if (!user_id || !order_date || !total_amount || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const ALLOWED_PM = ['Card', 'PayPal'];
    const pm = ALLOWED_PM.includes(payment_method) ? payment_method : null;
    const [result] = await db.query(
      'INSERT INTO orders (user_id, order_date, total_amount, status, payment_method) VALUES (?, ?, ?, ?, ?)',
      [user_id, order_date, total_amount, status, pm]
    );
    res.json({ message: 'Order added successfully', order_id: result.insertId });
  } catch (err) {
    console.error('❌ Error adding order:', err);
    res.status(500).json({ error: 'Failed to add order' });
  }
});

/// ⭐ יצירת הזמנה אמיתית עם פריטים + עדכון מלאי
router.post('/checkout', async (req, res) => {
  const db = await initDb();

  // אם initDb מחזיר Pool – נשתמש ב-getConnection,
  const conn = db.getConnection ? await db.getConnection() : db;

  try {
    const { user_id, items, payment_method } = req.body;

    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing items or user_id' });
    }

    if (conn.beginTransaction) {
      await conn.beginTransaction();
    }

    // חישוב סכום כולל מהפריטים (מחיר כולל מע"מ לפי טבלת products)
    let subtotal = 0;

    for (const it of items) {
      const [p] = await conn.query(
        'SELECT price FROM products WHERE product_id = ?',
        [it.product_id]
      );
      if (!p.length) throw new Error('Product not found: ' + it.product_id);

      const price = Number(p[0].price);
      subtotal += price * Number(it.quantity);
    }

    // קריאת אחוז מע"מ + משלוח מה-DB
    const vatPercent = await getCurrentVatPercent(db);
    const SHIPPING = 30;

    const totals = computeTotalsTaxIncluded({
      subtotalInclVat: subtotal,
      vatPercent,
      shipping: SHIPPING,
    });

    // ⭐ יצירת הזמנה בטבלת orders
    const [orderRes] = await conn.query(
      `INSERT INTO orders 
        (user_id, order_date, total_amount, status, vat_percent, shipping, payment_method)
       VALUES 
        (?, NOW(), ?, 'Pending', ?, ?, ?)
      `,
      [
        user_id,
        totals.final_total,
        vatPercent,
        SHIPPING,
        payment_method || null
      ]
    );

    const orderId = orderRes.insertId;

    // ⭐ הוספת פריטים להזמנה + עדכון מלאי
    for (const it of items) {
      const { product_id, quantity } = it;

      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        [orderId, product_id, quantity]
      );

      const [upd] = await conn.query(
        `UPDATE products 
         SET stock = stock - ?
         WHERE product_id = ? AND stock >= ?`,
        [quantity, product_id, quantity]
      );

      if (upd.affectedRows === 0) {
        throw new Error('Not enough stock for product ' + product_id);
      }
    }

    if (conn.commit) {
      await conn.commit();
    }

    res.json({ success: true, order_id: orderId });

  } catch (err) {
    if (conn.rollback) {
      try { await conn.rollback(); } catch (_) {}
    }
    console.error('❌ checkout error:', err);
    res.status(500).json({ error: 'Checkout failed', details: err.message });
  } finally {
    if (conn.release) {
      try { conn.release(); } catch (_) {}
    }
  }
});

module.exports = router;
