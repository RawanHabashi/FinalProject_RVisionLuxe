const express = require('express');
const router = express.Router();
const initDb = require('../config/dbSingleton');
router.get('/stats', async (req, res) => {
  try {
    const db = await initDb();
    const [users] = await db.query('SELECT COUNT(*) AS count FROM users');
    const [products] = await db.query('SELECT COUNT(*) AS count FROM products');
    const [categories] = await db.query('SELECT COUNT(*) AS count FROM categories');
    const [orders] = await db.query('SELECT COUNT(*) AS count FROM orders');

    res.json({
      users: users[0].count,
      products: products[0].count,
      categories: categories[0].count,
      orders: orders[0].count
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
