const express = require('express');
const router = express.Router();
const initDb = require('../config/dbSingleton'); // ← פונקציית התחברות למסד הנתונים
const PDFDocument = require('pdfkit');
const path = require('path');

// ✅ שליפת כל ההזמנות של משתמש מסוים לפי user_id
// ✅ שליפת כל ההזמנות של משתמש + פריטי ההזמנה (name, price, quantity)
router.get('/user/:user_id', async (req, res) => {
  try {
    const db = await initDb();
    const { user_id } = req.params;
    // 1) מביאים את ההזמנות של המשתמש
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC',
      [user_id]
    );
    if (!orders.length) {
      return res.json([]); // אין הזמנות
    }
    // 2) אוספים את מזהי ההזמנות כדי להביא את הפריטים פעם אחת ב-IN
    const orderIds = orders.map(o => o.order_id);
    const [itemsRows] = await db.query(
      `
      SELECT 
        oi.order_id,
        oi.product_id,
        oi.quantity,
        p.name AS product_name,
        p.price AS product_price
      FROM order_items oi
      JOIN products p ON p.product_id = oi.product_id
      WHERE oi.order_id IN (?)
      `,
      [orderIds]
    );
    // 3) מקבצים פריטים לפי order_id
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
    // 4) מחברים items לתוך כל הזמנה
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


// Get all orders
router.get('/', async (req, res) => {
  try {
    const db = await initDb(); // ← יצירת connection
    const [orders] = await db.query('SELECT * FROM orders');
    res.json(orders);
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    const db = await initDb(); // ← יצירת connection
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(`❌ Error fetching order ${orderId}:`, err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Add a new order
router.post('/', async (req, res) => {
  try {
    const db = await initDb(); // ← יצירת connection
    const { user_id, order_date, total_amount, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO orders (user_id, order_date, total_amount, status) VALUES (?, ?, ?, ?)',
      [user_id, order_date, total_amount, status]
    );
    res.json({
      message: 'Order added successfully',
      order_id: result.insertId
    });
  } catch (err) {
    console.error('❌ Error adding order:', err);
    res.status(500).json({ error: 'Failed to add order' });
  }
});

//לכל הזמנה יצירת חשבונית -PDF 
router.get('/invoice/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const db = await initDb();
    const [orderRows] = await db.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (orderRows.length === 0) return res.status(404).send('Order not found');
    const order = orderRows[0];
    const [products] = await db.query(`
  SELECT p.name, p.price, oi.quantity
  FROM order_items oi
  JOIN products p ON oi.product_id = p.product_id
  WHERE oi.order_id = ?
`, [orderId]);
    // PDF התחלה
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    //  כותרת
    doc
      .fontSize(20)
      .fillColor('#8B4513')
      .text(`Invoice for Order #${order.order_id}`, { align: 'center' })
      .moveDown(1);
      //  לוגו
    const logoPath = path.join(__dirname, '../images/Rvision Luxe-logo.jpg'); 
    doc.image(logoPath, doc.page.width / 2 - 75, doc.y, { width: 120 });
    doc.moveDown(3); 
    //  פרטי הזמנה
    doc
      .fontSize(12)
      .fillColor('black')
      .text(`Date: ${new Date(order.order_date).toLocaleString()}`)
      .text(`Status: ${order.status}`)
      .moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);
    //  פריטים
    doc.fontSize(14).text('Items:', { underline: true }).moveDown(0.5);
    let total = 0;
    products.forEach((product, i) => {
  const price = Number(product.price);
  const subtotal = price * product.quantity;
  total += subtotal;
  doc.fontSize(12)
    .text(`${i + 1}. ${product.name}`, { continued: true })
    .text(`$${price.toFixed(2)} x ${product.quantity} = $${subtotal.toFixed(2)}`, {
      align: 'right'
    });
});
    //  סיכום
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.fontSize(14).fillColor('#8B0000').text(`Total: $${total.toFixed(2)}`, {
      align: 'right',
      bold: true,
    });
    doc.end();
  } catch (err) {
    console.error("❌ Error generating invoice:", err);
    res.status(500).send('Error generating invoice');
  }
});
module.exports = router;
